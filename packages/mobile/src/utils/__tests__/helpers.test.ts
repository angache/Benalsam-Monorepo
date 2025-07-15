import { 
  formatPrice, 
  formatDate, 
  formatRelativeTime,
  truncateText,
  getInitials,
  isValidEmail,
  isValidPhoneNumber,
  capitalize,
  generateId,
  debounce
} from "../helpers";

describe("Helper Functions", () => {
  describe("formatPrice", () => {
    it("formats price correctly with Turkish locale", () => {
      expect(formatPrice(100)).toBe("₺100");
      expect(formatPrice(1500)).toBe("₺1.500");
      expect(formatPrice(0)).toBe("₺0");
      expect(formatPrice(999999)).toBe("₺999.999");
    });

    it("handles decimal values", () => {
      expect(formatPrice(99.99)).toBe("₺99,99");
      expect(formatPrice(1234.56)).toBe("₺1.234,56");
    });
  });

  describe("formatDate", () => {
    it("formats date to Turkish format", () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('15');
      expect(formatted).toContain('2023');
      expect(formatted).toContain('Ocak');
    });

    it("handles string dates", () => {
      const dateString = '2023-12-25T00:00:00Z';
      const formatted = formatDate(dateString);
      
      expect(formatted).toContain('25');
      expect(formatted).toContain('2023');
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      // Mock current time to 2023-01-01 12:00:00
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("formats recent times correctly", () => {
      const now = new Date('2023-01-01T12:00:00Z');
      
      // 30 seconds ago
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('Az önce');
      
      // 5 minutes ago
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 dakika önce');
      
      // 2 hours ago
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 saat önce');
      
      // 3 days ago
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 gün önce');
      
      // 2 weeks ago
      const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2 hafta önce');
      
      // 6 months ago
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(sixMonthsAgo)).toBe('6 ay önce');
      
      // 2 years ago
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoYearsAgo)).toBe('2 yıl önce');
    });

    it("handles string dates", () => {
      const oneHourAgo = '2023-01-01T11:00:00Z';
      expect(formatRelativeTime(oneHourAgo)).toBe('1 saat önce');
    });
  });

  describe("truncateText", () => {
    it("truncates long text correctly", () => {
      const longText = "Bu çok uzun bir metin örneği";
      expect(truncateText(longText, 10)).toBe("Bu çok uzu...");
      expect(truncateText(longText, 5)).toBe("Bu ço...");
    });

    it("returns original text if shorter than max length", () => {
      const shortText = "Kısa";
      expect(truncateText(shortText, 10)).toBe("Kısa");
      expect(truncateText(shortText, 4)).toBe("Kısa");
    });

    it("handles edge cases", () => {
      expect(truncateText("", 5)).toBe("");
      expect(truncateText("Test", 0)).toBe("...");
    });
  });

  describe("getInitials", () => {
    it("generates initials from single name", () => {
      expect(getInitials("Ali")).toBe("A");
    });

    it("generates initials from full name", () => {
      expect(getInitials("Ali Veli")).toBe("AV");
      expect(getInitials("Mehmet Ali Kaya")).toBe("MA");
    });

    it("handles lowercase names", () => {
      expect(getInitials("ali veli")).toBe("AV");
    });

    it("handles extra spaces", () => {
      expect(getInitials("  Ali   Veli  ")).toBe("AV");
    });

    it("handles empty string", () => {
      expect(getInitials("")).toBe("");
    });
  });

  describe("isValidEmail", () => {
    it("validates correct email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.org")).toBe(true);
      expect(isValidEmail("test+label@email.co.uk")).toBe(true);
      expect(isValidEmail("123@numbers.com")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("test.domain.com")).toBe(false);
      expect(isValidEmail("test@domain")).toBe(false);
    });
  });

  describe("isValidPhoneNumber", () => {
    it("validates Turkish phone numbers", () => {
      expect(isValidPhoneNumber("05551234567")).toBe(true);
      expect(isValidPhoneNumber("+905551234567")).toBe(true);
      expect(isValidPhoneNumber("0555 123 45 67")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isValidPhoneNumber("1234567890")).toBe(false);
      expect(isValidPhoneNumber("05551234567")).toBe(true); // 555 is valid
      expect(isValidPhoneNumber("0555123456")).toBe(false); // too short
      expect(isValidPhoneNumber("055512345678")).toBe(false); // too long
      expect(isValidPhoneNumber("")).toBe(false);
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
      expect(capitalize("tEST")).toBe("Test");
    });

    it("handles single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("generateId", () => {
    it("generates unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it("generates alphanumeric IDs", () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("delays function execution", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments correctly", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test", 123);
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("test", 123);
    });
  });
});
