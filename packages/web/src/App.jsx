import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster.jsx';
import { toast } from '@/components/ui/use-toast.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button.jsx';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAppContext } from '@/contexts/AppContext.jsx';
import AppRoutes from '@/components/AppRoutes.jsx';
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
  
  const { 
    currentUser, 
    loadingAuth,
    isDataLoading,
    handleAuthSuccess: originalHandleAuthSuccess, 
    handleLogout, 
    listings,
    setListings,
    inventoryItems,
    isProcessingData,
    notifications,
    unreadCount,
    unreadMessagesCount,
    handleSeedDatabase,
    handleClearDatabase,
    markNotificationAsRead,
    markAllAsRead,
    loadInitialData,
    handleToggleFavorite,
  } = useAppContext();
  

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAuthSuccess = async (isNewUser = false) => {
    await originalHandleAuthSuccess(); 
    if (isNewUser && currentUser?.id) {
        toast({
            title: "Profilinizi Tamamlayın!",
            description: "Harika! Şimdi profil bilgilerinizi güncelleyerek BenAlsam deneyiminizi kişiselleştirin.",
            duration: 7000, 
        });
        navigate(`/profil/${currentUser.id}?yeni_kayit=true`);
    } else {
      navigate('/');
    }
  };
  
  if (loadingAuth || isDataLoading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="pattern-dots fixed inset-0 opacity-20 pointer-events-none -z-10"></div>
      
      {!isConversationPage && (
        <Header 
          onCreateClick={() => navigate('/ilan-olustur')}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLoginClick={() => navigate('/auth?action=login')}
          onRegisterClick={() => navigate('/auth?action=register')}
          notifications={notifications}
          unreadCount={unreadCount}
          unreadMessagesCount={unreadMessagesCount}
          onNotificationClick={markNotificationAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}

      <main className={cn(
        "relative z-10 flex-grow flex flex-col",
        !isConversationPage && "pt-16 sm:pt-20"
      )}>
        
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 z-[100] flex flex-col space-y-2">
            <Button onClick={handleSeedDatabase} disabled={isProcessingData} variant="destructive" size="sm" className="text-xs sm:text-sm">
              {isProcessingData ? 'İşleniyor...' : '100 Sahte İlan Ekle'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isProcessingData} variant="outline" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm">
                  {isProcessingData ? 'Temizleniyor...' : '🧹 Tüm Veritabanını Temizle'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm sm:text-base">⚠️ Tüm Veritabanını Temizle</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-sm space-y-2">
                    <p className="font-semibold text-destructive">Bu işlem şunları kalıcı olarak silecek:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Tüm ilanlar ve resimler</li>
                      <li>Tüm teklifler ve ekler</li>
                      <li>Tüm mesajlar ve sohbetler</li>
                      <li>Tüm favoriler ve takipler</li>
                      <li>Tüm envanter ürünleri</li>
                      <li>Tüm bildirimler ve aktiviteler</li>
                      <li>Premium abonelikler ve istatistikler</li>
                    </ul>
                    <p className="font-semibold text-green-600">✅ Korunacaklar:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Kullanıcı profilleri ve hesapları</li>
                      <li>Kimlik doğrulama verileri</li>
                      <li>Profil resimleri</li>
                    </ul>
                    <p className="text-destructive font-semibold">Bu işlem GERİ ALINAMAZ!</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel disabled={isProcessingData} className="text-xs sm:text-sm">İptal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearDatabase} 
                    disabled={isProcessingData}
                    className="bg-destructive hover:bg-destructive/90 text-xs sm:text-sm"
                  >
                    {isProcessingData ? "🧹 Temizleniyor..." : "🗑️ Evet, Tümünü Temizle"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <AnimatePresence mode="wait">
          <AppRoutes
            listings={listings}
            setListings={setListings}
            inventoryItems={inventoryItems}
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            loadInitialData={loadInitialData}
          />
        </AnimatePresence>
      </main>

      {!isConversationPage && <Footer />}
      <Toaster />
    </div>
  );
}

export default App;