import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabaseClient';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { fcmTokenService } from '../services/fcmTokenService';
import ipChangeDetectionService from '../services/ipChangeDetectionService';
import type { User } from '../types';

interface AuthState {
  // State
  user: User | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  signInWithSession: () => Promise<boolean>;
  fetchUserProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
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
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/session-logger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          metadata: {
            ...metadata,
            platform: 'mobile',
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: true,
      initialized: false,

      // Actions
      setUser: (user) => {
        console.log('🔵 [AuthStore] Setting user:', user ? 'User exists' : 'No user');
        set({ user });
      },
      
      setLoading: (loading) => {
        console.log('🔵 [AuthStore] Setting loading:', loading);
        set({ loading });
      },

      signIn: async (email: string, password: string) => {
        try {
          console.log('🟡 [AuthStore] Starting sign in process...');
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            console.error('🔴 [AuthStore] Supabase auth error:', error);
            throw error;
          }

          if (!data.session) {
            console.error('🔴 [AuthStore] No session returned after login');
            throw new Error('Login successful but no session created');
          }

          // Enterprise Session Logging
          console.log('🔐 Enterprise Session: Logging login activity...');
          await sessionLoggerService.logSessionActivity(
            'login',
            { user_id: data.session.user.id }
          );

          // Start IP Change Detection Service
          console.log('🔍 [AuthStore] Starting IP Change Detection Service...');
          await ipChangeDetectionService.initialize();

          console.log('🟢 [AuthStore] Auth successful, fetching profile...');
          await get().fetchUserProfile(data.session.user.id);
          
          // FCM token'ı ayarla
          console.log('🔔 [AuthStore] Setting up FCM token...');
          await fcmTokenService.onUserLogin(data.session.user.id);
          
          console.log('🟢 [AuthStore] Profile fetched successfully');
          
        } catch (error) {
          console.error('🔴 [AuthStore] Error in signIn flow:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string, username: string) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });
          if (error) throw error;

          if (data.user && data.session) {
            // Enterprise Session Logging for signup
            console.log('🔐 Enterprise Session: Logging signup activity...');
            await sessionLoggerService.logSessionActivity(
              'login',
              { user_id: data.user.id }
            );

            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  email,
                  username,
                  created_at: new Date().toISOString(),
                },
              ]);
            if (profileError) throw profileError;
          }
        } catch (error) {
          console.error('Error signing up:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          console.log('🟡 [AuthStore] Starting sign out process...');
          set({ loading: true });
          
          // Get current user info before signing out
          const currentUser = get().user;
          
          // Try to log session activity first (if we have user info)
          if (currentUser?.id) {
            try {
              console.log('🔐 Enterprise Session: Logging logout activity...');
              await sessionLoggerService.logSessionActivity(
                'logout',
                { user_id: currentUser.id }
              );
            } catch (sessionError) {
              console.warn('⚠️ Session logging failed, continuing with logout:', sessionError);
            }
          }
          
          // Try to sign out from Supabase (but don't fail if it errors)
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.warn('⚠️ Supabase signOut failed:', error);
            }
          } catch (signOutError) {
            console.warn('⚠️ Supabase signOut threw error:', signOutError);
          }
          
          console.log('🟢 [AuthStore] Successfully signed out, resetting state...');
          
          // FCM token'ı temizle
          if (currentUser) {
            console.log('🔔 [AuthStore] Cleaning up FCM token...');
            await fcmTokenService.onUserLogout(currentUser.id);
          }
          
          // Reset user state
          set({ 
            user: null,
            loading: false,
            initialized: true 
          });
          console.log('🟢 [AuthStore] State reset complete');
          
        } catch (error) {
          console.error('🔴 [AuthStore] Error in signOut flow:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user logged in');

          set({ loading: true });

          // Önce Supabase'e gönder
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) throw error;

          // Başarılı olursa store'u güncelle
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });

          // Profil verisini yeniden çek
          const { data: refreshedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (refreshedProfile) {
            set({ user: refreshedProfile });
          }

          return refreshedProfile || updatedUser;
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signInWithSession: async () => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (data.session?.user) {
            await get().fetchUserProfile(data.session.user.id);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error signing in with session:', error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      fetchUserProfile: async (userId: string) => {
        try {
          console.log('🔍 [AuthStore] Fetching user profile for ID:', userId);
          
          // Önce session kontrolü
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('🔍 [AuthStore] Session check during profile fetch:', {
            hasSession: !!session,
            sessionError: sessionError?.message,
            sessionUser: session?.user?.id,
            requestedUser: userId,
            sessionExpiresAt: session?.expires_at
          });
          
          if (sessionError) {
            console.error('❌ [AuthStore] Session error:', sessionError);
            throw sessionError;
          }
          
          if (!session) {
            console.error('❌ [AuthStore] No session found during profile fetch');
            set({ user: null });
            return;
          }
          
          console.log('✅ [AuthStore] Session found, user ID:', session.user.id);
          console.log('✅ [AuthStore] Session user matches requested ID:', session.user.id === userId);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('❌ [AuthStore] Profile fetch error:', error);
            throw error;
          }

          const user: User = {
            id: data.id,
            email: data.email,
            username: data.username,
            avatar_url: data.avatar_url,
            created_at: data.created_at,
          };

          console.log('✅ [AuthStore] Profile fetched successfully:', {
            userId: user.id,
            email: user.email,
            username: user.username
          });
          set({ user });
        } catch (error) {
          console.error('❌ [AuthStore] Error fetching user profile:', error);
          set({ user: null });
        }
      },

      initialize: async () => {
        try {
          console.log('🟡 [AuthStore] Starting initialization...');
          set({ loading: true });
          
          // Check current session with detailed logging
          let { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('🔵 [AuthStore] Initial session check result:', {
            hasSession: !!session,
            sessionError: sessionError?.message,
            sessionUser: session?.user?.id,
            sessionExpiresAt: session?.expires_at,
            sessionAccessToken: session?.access_token ? 'EXISTS' : 'MISSING',
            sessionRefreshToken: session?.refresh_token ? 'EXISTS' : 'MISSING',
            currentTime: new Date().toISOString()
          });
          
          // If no session, try to refresh
          if (!session) {
            console.log('🔄 [AuthStore] No session found, attempting to refresh...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('❌ [AuthStore] Session refresh failed:', refreshError);
              // Session refresh failed, clear user state and force re-login
              console.log('🔄 [AuthStore] Clearing user state due to session failure');
              set({ user: null, loading: false, initialized: true });
              return;
            } else {
              session = refreshData.session;
              console.log('🔄 [AuthStore] Session refresh result:', {
                hasSession: !!session,
                sessionUser: session?.user?.id,
                sessionExpiresAt: session?.expires_at
              });
            }
          }
          
          if (session?.user) {
            console.log('🟢 [AuthStore] Found existing session, fetching profile...');
            
            // Enterprise Session Logging for existing session
            console.log('🔐 Enterprise Session: Logging existing session activity...');
            await sessionLoggerService.logSessionActivity(
              'login',
              { user_id: session.user.id }
            );
            
            // Start IP Change Detection Service
            console.log('🔍 [AuthStore] Starting IP Change Detection Service...');
            await ipChangeDetectionService.initialize();
            
            await get().fetchUserProfile(session.user.id);
          } else {
            console.log('🔴 [AuthStore] No session found during initialization');
            // Clear user state if no session
            set({ user: null });
          }

          // Setup auth state listener
          supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
            console.log('🔄 [AuthStore] Auth state changed:', {
              event,
              hasSession: !!session,
              sessionUser: session?.user?.id,
              sessionExpiresAt: session?.expires_at
            });
            
            if (event === 'SIGNED_IN') {
              console.log('🟢 [AuthStore] User signed in, fetching profile...');
              if (session?.user) {
                // Enterprise Session Logging for sign in
                console.log('🔐 Enterprise Session: Logging sign in activity...');
                await sessionLoggerService.logSessionActivity(
                  'login',
                  { user_id: session.user.id }
                );
                
                await get().fetchUserProfile(session.user.id);
                // FCM token'ı ayarla
                await fcmTokenService.onUserLogin(session.user.id);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('🟢 [AuthStore] User signed out, clearing user state...');
              const currentUser = get().user;
              if (currentUser) {
                await fcmTokenService.onUserLogout(currentUser.id);
              }
              set({ user: null });
            } else if (event === 'USER_UPDATED') {
              console.log('🟢 [AuthStore] User updated, refreshing profile...');
              if (session?.user) {
                await get().fetchUserProfile(session.user.id);
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔄 [AuthStore] Token refreshed, session updated');
            }
            
            set({ loading: false });
          });

          console.log('🟢 [AuthStore] Initialization complete');
          set({ initialized: true, loading: false });
        } catch (error) {
          console.error('🔴 [AuthStore] Error during initialization:', error);
          set({ loading: false });
        }
      },

      reset: () => {
        set({ user: null, loading: false, initialized: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        initialized: state.initialized,
      }),
    }
  )
); 