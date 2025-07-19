// ===========================
// SHARED TYPES EXPORT
// ===========================
// Export all types from the types module
export * from './types/index';
// ===========================
// SEARCH TYPES EXPORT
// ===========================
// Export search types
export * from './types/search';
// ===========================
// SHARED UTILITIES
// ===========================
/**
 * Format price with Turkish Lira symbol
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};
/**
 * Format date to Turkish locale
 */
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};
/**
 * Format relative time (e.g., "2 saat önce")
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'Az önce';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} dakika önce`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} gün önce`;
    }
    return formatDate(date);
};
/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
/**
 * Generate initials from name
 */
export const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
};
/**
 * Generate avatar URL with fallback
 */
export const getAvatarUrl = (avatarUrl, userId) => {
    if (avatarUrl) {
        return avatarUrl;
    }
    // Fallback to UI Avatars service
    const initials = userId ? getInitials(userId) : 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
};
/**
 * Check if user is premium
 */
export const isPremiumUser = (user) => {
    if (!user)
        return false;
    if (!user.is_premium)
        return false;
    if (user.premium_expires_at) {
        const expiryDate = new Date(user.premium_expires_at);
        return expiryDate > new Date();
    }
    return true;
};
/**
 * Calculate trust score level
 */
export const getTrustLevel = (trustScore) => {
    if (trustScore >= 1000)
        return 'platinum';
    if (trustScore >= 500)
        return 'gold';
    if (trustScore >= 100)
        return 'silver';
    return 'bronze';
};
/**
 * Get trust level color
 */
export const getTrustLevelColor = (level) => {
    switch (level) {
        case 'platinum': return '#E5E4E2';
        case 'gold': return '#FFD700';
        case 'silver': return '#C0C0C0';
        case 'bronze': return '#CD7F32';
        default: return '#C0C0C0';
    }
};
/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Turkish phone number format: +90 5XX XXX XX XX
    if (cleaned.length === 11 && cleaned.startsWith('90')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    // Turkish mobile number without country code: 5XX XXX XX XX
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
        return `+90 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return phone; // Return original if format doesn't match
};
//# sourceMappingURL=index.js.map