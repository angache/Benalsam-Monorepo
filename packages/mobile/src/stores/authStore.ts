import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabaseClient';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { fcmTokenService } from '../services/fcmTokenService';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

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

          if (data.user) {
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
          
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('🔴 [AuthStore] Error during signOut:', error);
            throw error;
          }
          
          console.log('🟢 [AuthStore] Successfully signed out, resetting state...');
          
          // FCM token'ı temizle
          const currentUser = get().user;
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