"use strict";
// ===========================
// SHARED TYPES EXPORT
// ===========================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.getTrustLevelColor = exports.getTrustLevel = exports.isPremiumUser = exports.getAvatarUrl = exports.truncateText = exports.getInitials = exports.validateEmail = exports.formatRelativeTime = exports.formatDate = exports.formatPrice = exports.ElasticsearchService = void 0;
// Export all types from the types module
__exportStar(require("./types/index"), exports);
// ===========================
// SEARCH TYPES EXPORT
// ===========================
// Export search types
__exportStar(require("./types/search"), exports);
// ===========================
// ELASTICSEARCH SERVICE EXPORT
// ===========================
// Export Elasticsearch service
var elasticsearchService_1 = require("./services/elasticsearchService");
Object.defineProperty(exports, "ElasticsearchService", { enumerable: true, get: function () { return elasticsearchService_1.ElasticsearchService; } });
// ===========================
// SHARED UTILITIES
// ===========================
/**
 * Format price with Turkish Lira symbol
 */
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};
exports.formatPrice = formatPrice;
/**
 * Format date to Turkish locale
 */
const formatDate = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};
exports.formatDate = formatDate;
/**
 * Format relative time (e.g., "2 saat önce")
 */
const formatRelativeTime = (date) => {
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
    return (0, exports.formatDate)(date);
};
exports.formatRelativeTime = formatRelativeTime;
/**
 * Validate email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
/**
 * Generate initials from name
 */
const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
exports.getInitials = getInitials;
/**
 * Truncate text with ellipsis
 */
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
};
exports.truncateText = truncateText;
/**
 * Generate avatar URL with fallback
 */
const getAvatarUrl = (avatarUrl, userId) => {
    if (avatarUrl) {
        return avatarUrl;
    }
    // Fallback to UI Avatars service
    const initials = userId ? (0, exports.getInitials)(userId) : 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
};
exports.getAvatarUrl = getAvatarUrl;
/**
 * Check if user is premium
 */
const isPremiumUser = (user) => {
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
exports.isPremiumUser = isPremiumUser;
/**
 * Calculate trust score level
 */
const getTrustLevel = (trustScore) => {
    if (trustScore >= 1000)
        return 'platinum';
    if (trustScore >= 500)
        return 'gold';
    if (trustScore >= 100)
        return 'silver';
    return 'bronze';
};
exports.getTrustLevel = getTrustLevel;
/**
 * Get trust level color
 */
const getTrustLevelColor = (level) => {
    switch (level) {
        case 'platinum': return '#E5E4E2';
        case 'gold': return '#FFD700';
        case 'silver': return '#C0C0C0';
        case 'bronze': return '#CD7F32';
        default: return '#C0C0C0';
    }
};
exports.getTrustLevelColor = getTrustLevelColor;
/**
 * Format phone number for display
 */
const formatPhoneNumber = (phone) => {
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
exports.formatPhoneNumber = formatPhoneNumber;
//# sourceMappingURL=index.js.map