export type IconType = any;
export declare const MessageStatus: {
    readonly SENT: "sent";
    readonly DELIVERED: "delivered";
    readonly READ: "read";
};
export type MessageStatusType = typeof MessageStatus[keyof typeof MessageStatus];
export declare const PremiumSubscriptionStatus: {
    readonly ACTIVE: "active";
    readonly CANCELLED: "cancelled";
    readonly EXPIRED: "expired";
    readonly PENDING: "pending";
};
export type PremiumSubscriptionStatusType = typeof PremiumSubscriptionStatus[keyof typeof PremiumSubscriptionStatus];
export declare const ProfileStatus: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
};
export type ProfileStatusType = typeof ProfileStatus[keyof typeof ProfileStatus];
export declare const ReportStatus: {
    readonly PENDING: "pending";
    readonly REVIEWED: "reviewed";
    readonly RESOLVED: "resolved";
    readonly DISMISSED: "dismissed";
};
export type ReportStatusType = typeof ReportStatus[keyof typeof ReportStatus];
export declare const ListingStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly PENDING_APPROVAL: "PENDING_APPROVAL";
    readonly REJECTED: "REJECTED";
    readonly SOLD: "SOLD";
    readonly DELETED: "DELETED";
    readonly EXPIRED: "EXPIRED";
};
export type ListingStatusType = typeof ListingStatus[keyof typeof ListingStatus];
export declare const AnalyticsEventType: {
    readonly PAGE_VIEW: "page_view";
    readonly SCREEN_VIEW: "screen_view";
    readonly BUTTON_CLICK: "button_click";
    readonly FORM_SUBMIT: "form_submit";
    readonly SEARCH: "search";
    readonly LISTING_VIEW: "listing_view";
    readonly LISTING_CREATE: "listing_create";
    readonly OFFER_SENT: "offer_sent";
    readonly MESSAGE_SENT: "message_sent";
    readonly APP_LOAD: "app_load";
    readonly API_CALL: "api_call";
    readonly ERROR_OCCURRED: "error_occurred";
    readonly CRASH: "crash";
    readonly USER_REGISTERED: "user_registered";
    readonly USER_LOGGED_IN: "user_logged_in";
    readonly PREMIUM_UPGRADED: "premium_upgraded";
    readonly PAYMENT_COMPLETED: "payment_completed";
};
export type AnalyticsEventTypeType = typeof AnalyticsEventType[keyof typeof AnalyticsEventType];
//# sourceMappingURL=enums.d.ts.map