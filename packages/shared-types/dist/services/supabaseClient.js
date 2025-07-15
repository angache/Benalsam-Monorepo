import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dnwreckpeenhbdtapmxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTgwNzAsImV4cCI6MjA2NTU3NDA3MH0.2lzsxTj4hoKTcZeoCGMsUC3Cmsm1pgcqXP-3j_GV_Ys';
// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
// Type-safe database helpers
export const db = {
    // Profiles
    profiles: () => supabase.from('profiles'),
    // Listings
    listings: () => supabase.from('listings'),
    // Offers
    offers: () => supabase.from('offers'),
    // Conversations
    conversations: () => supabase.from('conversations'),
    // Messages
    messages: () => supabase.from('messages'),
    // Notifications
    notifications: () => supabase.from('notifications'),
    // Storage
    storage: supabase.storage,
    // Auth
    auth: supabase.auth
};
export default supabase;
