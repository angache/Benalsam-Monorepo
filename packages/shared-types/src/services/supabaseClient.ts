import { createClient } from '@supabase/supabase-js';
import type { User, Listing, Offer, Conversation, Message } from '../types';

const supabaseUrl = 'https://dnwreckpeenhbdtapmxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTgwNzAsImV4cCI6MjA2NTU3NDA3MH0.2lzsxTj4hoKTcZeoCGMsUC3Cmsm1pgcqXP-3j_GV_Ys';

// Database schema types
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

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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