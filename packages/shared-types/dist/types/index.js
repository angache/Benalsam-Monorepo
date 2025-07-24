"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingStatus = exports.ReportStatus = exports.ProfileStatus = exports.PremiumSubscriptionStatus = exports.MessageStatus = void 0;
// ===========================
// STATUS ENUMS
// ===========================
exports.MessageStatus = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read'
};
exports.PremiumSubscriptionStatus = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    PENDING: 'pending'
};
exports.ProfileStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};
exports.ReportStatus = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed'
};
exports.ListingStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    REJECTED: 'REJECTED',
    SOLD: 'SOLD',
    DELETED: 'DELETED',
    EXPIRED: 'EXPIRED'
};
//# sourceMappingURL=index.js.map