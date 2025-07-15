import type { User, Listing, Offer, Conversation, Message } from '../types';
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at'>>;
            };
            listings: {
                Row: Listing;
                Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'user'>;
                Update: Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'user'>>;
            };
            offers: {
                Row: Offer;
                Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'user' | 'listing'>;
                Update: Partial<Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'user' | 'listing'>>;
            };
            conversations: {
                Row: Conversation;
                Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'listing' | 'user1' | 'user2'>;
                Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'listing' | 'user1' | 'user2'>>;
            };
            messages: {
                Row: Message;
                Insert: Omit<Message, 'id' | 'created_at' | 'sender'>;
                Update: Partial<Omit<Message, 'id' | 'created_at' | 'sender'>>;
            };
            notifications: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", any>;
export declare const db: {
    profiles: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "profiles", unknown>;
    listings: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "listings", unknown>;
    offers: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "offers", unknown>;
    conversations: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "conversations", unknown>;
    messages: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "messages", unknown>;
    notifications: () => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, "notifications", unknown>;
    storage: import("@supabase/storage-js").StorageClient;
    auth: import("@supabase/supabase-js/dist/module/lib/SupabaseAuthClient").SupabaseAuthClient;
};
export default supabase;
