export * from './types/index';
export * from './types/search';
/**
 * Format price with Turkish Lira symbol
 */
export declare const formatPrice: (price: number) => string;
/**
 * Format date to Turkish locale
 */
export declare const formatDate: (date: string | Date) => string;
/**
 * Format relative time (e.g., "2 saat önce")
 */
export declare const formatRelativeTime: (date: string | Date) => string;
/**
 * Validate email format
 */
export declare const validateEmail: (email: string) => boolean;
/**
 * Generate initials from name
 */
export declare const getInitials: (name: string) => string;
/**
 * Truncate text with ellipsis
 */
export declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Generate avatar URL with fallback
 */
export declare const getAvatarUrl: (avatarUrl?: string | null, userId?: string) => string;
/**
 * Check if user is premium
 */
export declare const isPremiumUser: (user?: {
    is_premium?: boolean;
    premium_expires_at?: string;
}) => boolean;
/**
 * Calculate trust score level
 */
export declare const getTrustLevel: (trustScore: number) => "bronze" | "silver" | "gold" | "platinum";
/**
 * Get trust level color
 */
export declare const getTrustLevelColor: (level: "bronze" | "silver" | "gold" | "platinum") => string;
/**
 * Format phone number for display
 */
export declare const formatPhoneNumber: (phone: string) => string;
//# sourceMappingURL=index.d.ts.map