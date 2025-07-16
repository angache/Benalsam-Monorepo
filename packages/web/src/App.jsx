import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster.jsx';
import { toast } from '@/components/ui/use-toast.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button.jsx';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores';
import AppRoutes from '@/components/AppRoutes.jsx';
import AppErrorBoundary from '@/components/ErrorBoundaries/AppErrorBoundary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils.js';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isConversationPage = location.pathname.startsWith('/mesajlar/');
  
  const { currentUser, loading: loadingAuth, initialize } = useAuthStore();
  
  // Auth store automatically initializes on mount
  // No need to call initialize() manually

  useEffect(() => {
    console.log('🔐 Auth Store State:', { currentUser, loadingAuth });
    console.log('🔐 Auth Store Raw State:', useAuthStore.getState());
  }, [currentUser, loadingAuth]);
  

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loadingAuth) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="pattern-dots fixed inset-0 opacity-20 pointer-events-none -z-10"></div>
        
        {!isConversationPage && (
          <Header 
            onCreateClick={() => navigate('/ilan-olustur')}
            currentUser={currentUser}
            onLogout={() => useAuthStore.getState().signOut()}
            onLoginClick={() => navigate('/auth?action=login')}
            onRegisterClick={() => navigate('/auth?action=register')}
          />
        )}

        <main className={cn(
          "relative z-10 flex-grow flex flex-col",
          !isConversationPage && "pt-16 sm:pt-20"
        )}>
          <AnimatePresence mode="wait">
            <AppRoutes currentUser={currentUser} />
          </AnimatePresence>
        </main>

        {!isConversationPage && <Footer />}
        <Toaster />
      </div>
    </AppErrorBoundary>
  );
}

export default App;