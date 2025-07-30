import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { fetchUserProfile } from '@/services/profileService';
import { User } from '@benalsam/shared-types';

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

// Enterprise Session Logger Service
const sessionLoggerService = {
  async logSessionActivity(action: 'login' | 'logout' | 'activity', metadata = {}) {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session found for logging');
        return false;
      }

      // Call Edge Function for session logging
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-logger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          metadata: {
            ...metadata,
            platform: 'web',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Enterprise Session Logger: Failed to log session activity', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Enterprise Session Logger: Session activity logged successfully', result);
      return true;
    } catch (error) {
      console.error('❌ Enterprise Session Logger Error:', error);
      return false;
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Auto-initialize on store creation
  const initializeStore = async () => {
    console.log('🔐 Auth Store: Auto-initializing...');
    set({ loading: true });
    
    try {
      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth Store: Session check result:', { hasSession: !!session, userId: session?.user?.id });
      
      if (session?.user) {
        // Set basic user info from session
        const basicUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'Kullanıcı',
          avatar_url: session.user.user_metadata?.avatar_url,
          rating: null,
          total_ratings: 0,
          rating_sum: 0,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at
        };
        
        set({ user: basicUser, currentUser: basicUser, loading: false, initialized: true });
        console.log('🔐 Auth Store: Basic user set, profile will be fetched by React Query when needed');
      } else {
        console.log('🔐 Auth Store: No session found');
        set({ user: null, currentUser: null, loading: false, initialized: true });
      }

      // Only listen for SIGNED_OUT events to clear state
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          console.log('🔐 Auth Store: User signed out');
          set({ user: null, currentUser: null });
        }
      });
    } catch (error) {
      console.error('🔐 Auth Store: Initialize error:', error);
      set({ user: null, currentUser: null, loading: false, initialized: true });
    }
  };

  // Start initialization immediately
  initializeStore();

  return {
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
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user && data.session) {
          // Enterprise Session Logging
          console.log('🔐 Enterprise Session: Logging login activity...');
          await sessionLoggerService.logSessionActivity(
            'login',
            { user_id: data.user.id, email: data.user.email }
          );

          const basicUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'Kullanıcı',
            avatar_url: data.user.user_metadata?.avatar_url,
            rating: null,
            total_ratings: 0,
            rating_sum: 0,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at
          };
          set({ user: basicUser, currentUser: basicUser, loading: false });
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
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user && data.session) {
          // Enterprise Session Logging for signup
          console.log('🔐 Enterprise Session: Logging signup activity...');
          await sessionLoggerService.logSessionActivity(
            'login',
            { user_id: data.user.id, email: data.user.email }
          );

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

          const basicUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || name,
            avatar_url: data.user.user_metadata?.avatar_url || avatar_url,
            rating: null,
            total_ratings: 0,
            rating_sum: 0,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at
          };
          set({ user: basicUser, currentUser: basicUser, loading: false });
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
        // Get current session before signing out
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Enterprise Session Logging for logout
          console.log('🔐 Enterprise Session: Logging logout activity...');
          await sessionLoggerService.logSessionActivity(
            'logout',
            { user_id: session.user.id, email: session.user.email }
          );
        }

        await supabase.auth.signOut();
        set({ user: null, currentUser: null, loading: false });
      } catch (error) {
        set({ loading: false });
      }
    },

    initialize: async () => {
      // This function is kept for compatibility but auto-initialization is handled in store creation
      console.log('🔐 Auth Store: Manual initialize called (auto-initialization already running)');
    },
  };
}); 