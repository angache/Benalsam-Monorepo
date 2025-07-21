declare const types: any;
declare const searchTypes: any;
/**
 * Format price with Turkish Lira symbol
 */
declare const formatPrice: (price: number) => string;
/**
 * Format date to Turkish locale
 */
declare const formatDate: (date: string | Date) => string;
/**
 * Format relative time (e.g., "2 saat önce")
 */
declare const formatRelativeTime: (date: string | Date) => string;
/**
 * Validate email format
 */
declare const validateEmail: (email: string) => boolean;
/**
 * Generate initials from name
 */
declare const getInitials: (name: string) => string;
/**
 * Truncate text with ellipsis
 */
declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Generate avatar URL with fallback
 */
declare const getAvatarUrl: (avatarUrl?: string | null, userId?: string) => string;
/**
 * Check if user is premium
 */
declare const isPremiumUser: (user?: {
    is_premium?: boolean;
    premium_expires_at?: string;
}) => boolean;
/**
 * Calculate trust score level
 */
declare const getTrustLevel: (trustScore: number) => "bronze" | "silver" | "gold" | "platinum";
/**
 * Get trust level color
 */
declare const getTrustLevelColor: (level: "bronze" | "silver" | "gold" | "platinum") => string;
/**
 * Format phone number for display
 */
declare const formatPhoneNumber: (phone: string) => string;
//# sourceMappingURL=index.d.ts.map