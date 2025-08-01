import { supabase, db } from '@/lib/supabaseClient';
import type { User, ApiResponse } from '@/types';
import { useState, useEffect } from 'react';

// ===========================
// AUTH TYPES
// ===========================

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  avatar_url?: string;
}

// ===========================
// AUTH SERVICE
// ===========================

export class AuthService {
  /**
   * Kullanıcı kaydı
   */
  static async signUp(data: SignUpData): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            name: data.name,
          },
        },
      });

      if (authError) {
        return { error: { message: authError.message, code: authError.name } };
      }

      if (!authData.user) {
        return { error: { code: 'USER_CREATION_FAILED', message: 'Kullanıcı oluşturulamadı' } };
      }

      // Profil oluştur
      const { error: profileError } = await db.profiles().insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        name: data.name,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        return { error: { code: 'PROFILE_CREATION_FAILED', message: 'Profil oluşturulamadı', details: profileError } };
      }

      // Kullanıcı bilgilerini getir
      const user = await this.getUserProfile(authData.user.id);
      return { data: user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'Kayıt işlemi başarısız oldu' } };
    }
  }

  /**
   * Kullanıcı girişi
   */
  static async signIn(data: SignInData): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { error: { message: authError.message, code: authError.name } };
      }

      if (!authData.user) {
        return { error: { message: 'Giriş başarısız' } };
      }

      // Kullanıcı bilgilerini getir
      const user = await this.getUserProfile(authData.user.id);
      return { data: user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'Giriş işlemi başarısız oldu' } };
    }
  }

  /**
   * Kullanıcı çıkışı
   */
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'Çıkış işlemi başarısız oldu' } };
    }
  }

  /**
   * Mevcut oturumu kontrol et
   */
  static async getCurrentSession(): Promise<ApiResponse<User | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      if (!session?.user) {
        return { data: null };
      }

      const user = await this.getUserProfile(session.user.id);
      return { data: user };
    } catch (error) {
      console.error('Get session error:', error);
      return { error: { message: 'Oturum bilgisi alınamadı' } };
    }
  }

  /**
   * Kullanıcı profilini getir
   */
  static async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await db.profiles()
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Profil getirilemedi: ${error.message}`);
    }

    return data;
  }

  /**
   * Profil güncelle
   */
  static async updateProfile(userId: string, updates: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await db.profiles()
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: { message: 'Profil güncellenemedi' } };
    }
  }

  /**
   * Şifre sıfırlama e-postası gönder
   */
  static async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: { message: 'Şifre sıfırlama e-postası gönderilemedi' } };
    }
  }

  /**
   * Şifre güncelle
   */
  static async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: { message: 'Şifre güncellenemedi' } };
    }
  }

  /**
   * E-posta doğrulama
   */
  static async verifyEmail(email: string, token: string, type: 'signup' | 'recovery'): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Verify email error:', error);
      return { error: { message: 'E-posta doğrulanamadı' } };
    }
  }
}

// ===========================
// AUTH HOOKS
// ===========================

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const checkSession = async () => {
      try {
        const result = await AuthService.getCurrentSession();
        if (result.data) {
          setUser(result.data);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await AuthService.getUserProfile(session.user.id);
          setUser(user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
        setInitialized(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (data: SignInData) => {
    setLoading(true);
    const result = await AuthService.signIn(data);
    if (result.data) {
      setUser(result.data);
    }
    setLoading(false);
    return result;
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    const result = await AuthService.signUp(data);
    if (result.data) {
      setUser(result.data);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await AuthService.signOut();
    if (!result.error) {
      setUser(null);
    }
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user) return { error: { message: 'Kullanıcı girişi gerekli' } };
    
    const result = await AuthService.updateProfile(user.id, updates);
    if (result.data) {
      setUser(result.data);
    }
    return result;
  };

  return {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};

export default AuthService; 