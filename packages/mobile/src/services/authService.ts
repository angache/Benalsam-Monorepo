import { supabase } from './supabaseClient';
import { User } from '../types';
import { fcmTokenService } from './fcmTokenService';
import ipChangeDetectionService from './ipChangeDetectionService';

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

export class AuthService {
  /**
   * Kullanıcı girişi
   */
  static async signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    try {
      console.log('🟡 [AuthService] Starting sign in process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('🔴 [AuthService] Supabase auth error:', error);
        return { user: null, error: error.message };
      }

      if (!data.session) {
        console.error('🔴 [AuthService] No session returned after login');
        return { user: null, error: 'Login successful but no session created' };
      }

      // Enterprise Session Logging
      console.log('🔐 Enterprise Session: Logging login activity...');
      await sessionLoggerService.logSessionActivity(
        'login',
        { user_id: data.session.user.id }
      );

      // Start IP Change Detection Service
      console.log('🔍 [AuthService] Starting IP Change Detection Service...');
      await ipChangeDetectionService.initialize();

      // Fetch user profile
      console.log('🟢 [AuthService] Auth successful, fetching profile...');
      const user = await this.fetchUserProfile(data.session.user.id);
      
      // FCM token'ı ayarla
      console.log('🔔 [AuthService] Setting up FCM token...');
      await fcmTokenService.onUserLogin(data.session.user.id);
      
      console.log('🟢 [AuthService] Profile fetched successfully');
      
      return { user };
    } catch (error) {
      console.error('🔴 [AuthService] Error in signIn flow:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Kullanıcı kaydı
   */
  static async signUp(email: string, password: string, username: string): Promise<{ user: User | null; error?: string }> {
    try {
      console.log('🟡 [AuthService] Starting sign up process...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        console.error('🔴 [AuthService] Sign up error:', error);
        return { user: null, error: error.message };
      }

      if (!data.user) {
        console.error('🔴 [AuthService] No user data returned after signup');
        return { user: null, error: 'Signup successful but no user data returned' };
      }

      // Create profile
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
        
      if (profileError) {
        console.error('🔴 [AuthService] Profile creation error:', profileError);
        return { user: null, error: 'Failed to create user profile' };
      }

      // Enterprise Session Logging for signup
      console.log('🔐 Enterprise Session: Logging signup activity...');
      await sessionLoggerService.logSessionActivity(
        'login',
        { user_id: data.user.id }
      );

             const user: User = {
         id: data.user.id,
         email: data.user.email!,
         username,
         avatar_url: undefined,
         created_at: new Date().toISOString(),
       };

      console.log('🟢 [AuthService] Sign up successful');
      return { user };
    } catch (error) {
      console.error('🔴 [AuthService] Error in signUp flow:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Kullanıcı çıkışı
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🟡 [AuthService] Starting sign out process...');
      
      // Get current user info before signing out
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
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
      
      console.log('🟢 [AuthService] Successfully signed out, cleaning up...');
      
      // FCM token'ı temizle
      if (currentUser) {
        console.log('🔔 [AuthService] Cleaning up FCM token...');
        await fcmTokenService.onUserLogout(currentUser.id);
      }
      
      console.log('🟢 [AuthService] Sign out complete');
      return { success: true };
      
    } catch (error) {
      console.error('🔴 [AuthService] Error in signOut flow:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Session ile giriş
   */
  static async signInWithSession(): Promise<{ user: User | null; error?: string }> {
    try {
      console.log('🟡 [AuthService] Checking existing session...');
      
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('🔴 [AuthService] Session check error:', error);
        return { user: null, error: error.message };
      }
      
      if (data.session?.user) {
        console.log('🟢 [AuthService] Found existing session, fetching profile...');
        
        // Enterprise Session Logging for existing session
        console.log('🔐 Enterprise Session: Logging existing session activity...');
        await sessionLoggerService.logSessionActivity(
          'login',
          { user_id: data.session.user.id }
        );
        
        // Start IP Change Detection Service
        console.log('🔍 [AuthService] Starting IP Change Detection Service...');
        await ipChangeDetectionService.initialize();
        
        const user = await this.fetchUserProfile(data.session.user.id);
        return { user };
      }
      
      console.log('🔴 [AuthService] No session found');
      return { user: null };
    } catch (error) {
      console.error('🔴 [AuthService] Error in signInWithSession:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Kullanıcı profilini getir
   */
  static async fetchUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('🔍 [AuthService] Fetching user profile for ID:', userId);
      
      // Önce session kontrolü
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 [AuthService] Session check during profile fetch:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        sessionUser: session?.user?.id,
        requestedUser: userId,
        sessionExpiresAt: session?.expires_at
      });
      
      if (sessionError) {
        console.error('❌ [AuthService] Session error:', sessionError);
        return null;
      }
      
      if (!session) {
        console.error('❌ [AuthService] No session found during profile fetch');
        return null;
      }
      
      console.log('✅ [AuthService] Session found, user ID:', session.user.id);
      console.log('✅ [AuthService] Session user matches requested ID:', session.user.id === userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [AuthService] Profile fetch error:', error);
        return null;
      }

      const user: User = {
        id: data.id,
        email: data.email,
        username: data.username,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
      };

      console.log('✅ [AuthService] Profile fetched successfully:', {
        userId: user.id,
        email: user.email,
        username: user.username
      });
      
      return user;
    } catch (error) {
      console.error('❌ [AuthService] Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Auth state listener'ı kur
   */
  static setupAuthStateListener(onAuthStateChange: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthService] Auth state changed:', {
        event,
        hasSession: !!session,
        sessionUser: session?.user?.id,
        sessionExpiresAt: session?.expires_at
      });
      
      onAuthStateChange(event, session);
    });
  }
} 