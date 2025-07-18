"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingStatus = exports.AdminRole = void 0;
// ===========================
// ADMIN TYPES
// ===========================
// Admin Role enum
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["CATEGORY_MANAGER"] = "CATEGORY_MANAGER";
    AdminRole["ANALYTICS_MANAGER"] = "ANALYTICS_MANAGER";
    AdminRole["USER_MANAGER"] = "USER_MANAGER";
    AdminRole["CONTENT_MANAGER"] = "CONTENT_MANAGER";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
// Listing Status enum for admin compatibility
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "active";
    ListingStatus["INACTIVE"] = "inactive";
    ListingStatus["PENDING"] = "pending";
    ListingStatus["REJECTED"] = "rejected";
    ListingStatus["SOLD"] = "sold";
    ListingStatus["DELETED"] = "deleted";
    ListingStatus["EXPIRED"] = "expired";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
//# sourceMappingURL=index.js.map