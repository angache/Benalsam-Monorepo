import { createClient } from '@supabase/supabase-js';
// React Native AsyncStorage import (will be undefined in web)
let AsyncStorage;
try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
}
catch {
    // Web environment - AsyncStorage not available
    AsyncStorage = undefined;
}
const supabaseUrl = 'https://dnwreckpeenhbdtapmxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTgwNzAsImV4cCI6MjA2NTU3NDA3MH0.2lzsxTj4hoKTcZeoCGMsUC3Cmsm1pgcqXP-3j_GV_Ys';
// Create Supabase client with platform-specific config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: !AsyncStorage, // false for React Native, true for web
        flowType: AsyncStorage ? 'pkce' : 'implicit',
        debug: false,
        storageKey: AsyncStorage ? 'benalsam-auth-storage' : undefined,
    },
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
