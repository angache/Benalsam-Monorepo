import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchUserProfile } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState('login');
  const [emailJustConfirmed, setEmailJustConfirmed] = useState(false);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);


  useEffect(() => {
    setLoadingAuth(true); 
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const previousSession = sessionRef.current;
        setSession(newSession);

        if (newSession?.user) {
          let profile = await fetchUserProfile(newSession.user.id);
          if (profile) {
            if (profile.avatar_url) {
              profile.avatar_url = `${profile.avatar_url}?t=${new Date().getTime()}`;
            }
            const combinedUser = { ...newSession.user, ...profile };
            setCurrentUser(combinedUser);

            const justConfirmed = newSession.user.email_confirmed_at && 
                                  (!previousSession?.user || !previousSession.user.email_confirmed_at);
            
            if (justConfirmed && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
              setEmailJustConfirmed(true);
            }
          } else {
            setCurrentUser(null);
            if (_event !== 'SIGNED_OUT') {
              toast({ title: "Profil Yüklenemedi", description: "Oturum aktif ancak profil yüklenemedi. Otomatik çıkış yapılıyor.", variant: "warning" });
              await supabase.auth.signOut();
            }
          }
        } else {
          setCurrentUser(null);
        }
        
        setLoadingAuth(false);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (emailJustConfirmed) {
      toast({ title: "E-posta Doğrulandı!", description: "E-posta adresiniz başarıyla doğrulandı." });
      setEmailJustConfirmed(false); // Reset flag after showing toast
    }
  }, [emailJustConfirmed]);

  const handleAuthSuccess = useCallback(async () => {
    setLoadingAuth(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        let profile = await fetchUserProfile(user.id);
        if (profile) {
            if (profile.avatar_url) {
                profile.avatar_url = `${profile.avatar_url}?t=${new Date().getTime()}`;
            }
            const combinedUser = { ...user, ...profile };
            setCurrentUser(combinedUser);
            toast({ title: "Başarılı!", description: `Hoş geldin ${profile?.name || user.email}!`, });
        } else {
            setCurrentUser(null);
            toast({ title: "Profil Yüklenemedi", description: "Giriş başarılı ancak profil yüklenemedi.", variant: "destructive" });
            await supabase.auth.signOut();
        }
    } else {
        setCurrentUser(null); 
    }
    setIsAuthModalOpen(false);
    setLoadingAuth(false);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoadingAuth(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Çıkış Hatası", description: error.message, variant: "destructive" });
    } else {
      setCurrentUser(null);
      setSession(null);
      toast({ title: "Çıkış Yapıldı", description: "Başarıyla çıkış yaptınız." });
    }
    setLoadingAuth(false);
  }, []);

  const openAuthModal = useCallback((actionType) => {
    setAuthAction(actionType);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const switchAuthAction = useCallback((newAction) => {
    setAuthAction(newAction);
  }, []);


  return {
    session,
    currentUser,
    loadingAuth,
    setLoadingAuth,
    isAuthModalOpen,
    authAction,
    handleAuthSuccess,
    handleLogout,
    openAuthModal,
    closeAuthModal,
    switchAuthAction,
    setCurrentUser 
  };
};