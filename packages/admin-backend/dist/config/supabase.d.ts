export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const supabasePublic: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const mockListings: any[];
export interface Database {
    public: {
        Tables: {
            listings: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    price: number;
                    category: string;
                    condition: string | null;
                    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
                    views: number;
                    favorites: number;
                    user_id: string;
                    moderated_at: string | null;
                    moderated_by: string | null;
                    moderation_reason: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    price: number;
                    category: string;
                    condition?: string | null;
                    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
                    views?: number;
                    favorites?: number;
                    user_id: string;
                    moderated_at?: string | null;
                    moderated_by?: string | null;
                    moderation_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    price?: number;
                    category?: string;
                    condition?: string | null;
                    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
                    views?: number;
                    favorites?: number;
                    user_id?: string;
                    moderated_at?: string | null;
                    moderated_by?: string | null;
                    moderation_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    avatar: string | null;
                    status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED';
                    trust_score: number;
                    last_login_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    avatar?: string | null;
                    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED';
                    trust_score?: number;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    avatar?: string | null;
                    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED';
                    trust_score?: number;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            listing_images: {
                Row: {
                    id: string;
                    listing_id: string;
                    url: string;
                    order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    listing_id: string;
                    url: string;
                    order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    listing_id?: string;
                    url?: string;
                    order?: number;
                    created_at?: string;
                };
            };
            listing_locations: {
                Row: {
                    id: string;
                    listing_id: string;
                    city: string;
                    district: string;
                    neighborhood: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    listing_id: string;
                    city: string;
                    district: string;
                    neighborhood?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    listing_id?: string;
                    city?: string;
                    district?: string;
                    neighborhood?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    created_at?: string;
                };
            };
            admin_users: {
                Row: {
                    id: string;
                    email: string;
                    password: string;
                    first_name: string;
                    last_name: string;
                    role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
                    permissions: any | null;
                    is_active: boolean;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    password: string;
                    first_name: string;
                    last_name: string;
                    role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
                    permissions?: any | null;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    password?: string;
                    first_name?: string;
                    last_name?: string;
                    role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
                    permissions?: any | null;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
//# sourceMappingURL=supabase.d.ts.map