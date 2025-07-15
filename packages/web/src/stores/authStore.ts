import { create } from 'zustand';
import { supabase } from '@benalsam/shared-types';
import { fetchUserProfile } from '@/services/profileService.js';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  rating?: number;
  total_ratings?: number;
  rating_sum?: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  currentUser: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        set({ user: profile, currentUser: profile, loading: false });
      }

      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'Giriş yapılırken bir hata oluştu' };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    try {
      const avatar_url = `https://source.boringavatars.com/beam/120/${name.replace(/\s+/g, '') || 'benalsamUser'}?colors=ff6b35,f7931e,ff8c42,1a0f0a,2d1810`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar_url,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Update profile with avatar_url
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name, 
            avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Error updating profile on signup:", profileError);
        }

        const profile = await fetchUserProfile(data.user.id);
        set({ user: profile, currentUser: profile, loading: false });
      }

      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'Kayıt olurken bir hata oluştu' };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, currentUser: null, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  initialize: async () => {
    console.log('🔐 Auth Store: Initializing...');
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth Store: Session check result:', { hasSession: !!session, userId: session?.user?.id });
      
      if (session?.user) {
        console.log('🔐 Auth Store: User found, fetching profile...');
        const profile = await fetchUserProfile(session.user.id);
        console.log('🔐 Auth Store: Profile fetched:', profile);
        set({ user: profile, currentUser: profile, loading: false, initialized: true });
        console.log('🔐 Auth Store: State updated with user');
      } else {
        console.log('🔐 Auth Store: No session found');
        set({ user: null, currentUser: null, loading: false, initialized: true });
      }

      // Auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth Store: Auth state change:', event, { userId: session?.user?.id });
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          console.log('🔐 Auth Store: User signed in, profile:', profile);
          set({ user: profile, currentUser: profile });
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 Auth Store: User signed out');
          set({ user: null, currentUser: null });
        }
      });
    } catch (error) {
      console.error('🔐 Auth Store: Initialize error:', error);
      set({ user: null, currentUser: null, loading: false, initialized: true });
    }
  },
})); 