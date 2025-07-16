
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores';
import PageErrorBoundary from '@/components/ErrorBoundaries/PageErrorBoundary';

import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage.jsx';
import InventoryPage from '@/pages/InventoryPage';
import MyListingsPage from '@/pages/MyListingsPage.jsx';
import ListingDetailPage from '@/pages/ListingDetailPage';
import SentOffersPage from '@/pages/SentOffersPage';
import ReceivedOffersPage from '@/pages/ReceivedOffersPage';
import ConversationPage from '@/pages/ConversationPage';
import ConversationsListPage from '@/pages/ConversationsListPage.jsx';
import AuthCallbackPage from '@/pages/AuthCallbackPage.jsx';
import FavoritesPage from '@/pages/FavoritesPage.jsx'; 
import FollowingPage from '@/pages/FollowingPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage';
import AdBanner from '@/components/AdBanner';
import SearchResultsPage from '@/pages/SearchResultsPage.jsx';

import CreateListingPage from '@/pages/CreateListingPage.jsx';
import AuthPage from '@/pages/AuthPage.jsx';
import MakeOfferPage from '@/pages/MakeOfferPage.jsx';
import ReportListingPage from '@/pages/ReportListingPage.jsx';
import LeaveReviewPage from '@/pages/LeaveReviewPage.jsx';
import InventoryFormPage from '@/pages/InventoryFormPage.jsx';
import EditListingPage from '@/pages/EditListingPage.jsx';
import StockImageSearchPage from '@/pages/StockImageSearchPage.jsx';
import FollowCategoryPage from '@/pages/FollowCategoryPage.jsx';
import ListingRulesPage from '@/pages/ListingRulesPage.jsx';
import DopingPage from '@/pages/DopingPage.jsx';
import PremiumPage from '@/pages/PremiumPage.jsx';
import TrustScorePage from '@/pages/TrustScorePage.jsx';
import UnpublishListingPage from '@/pages/UnpublishListingPage.jsx';
import ErrorTestComponent from '@/components/ErrorBoundaries/ErrorTestComponent';

import SettingsLayout from '@/pages/SettingsPage/SettingsLayout.jsx';
import ProfileSettings from '@/pages/SettingsPage/ProfileSettings.jsx';
import ContactSettings from '@/pages/SettingsPage/ContactSettings.jsx';
import SecuritySettings from '@/pages/SettingsPage/SecuritySettings.jsx';
import NotificationSettings from '@/pages/SettingsPage/NotificationSettings.jsx';
import PlatformSettings from '@/pages/SettingsPage/PlatformSettings.jsx';
import AccountSettings from '@/pages/SettingsPage/AccountSettings.jsx';
import FeedbackSection from '@/pages/SettingsPage/FeedbackSection.jsx';
import PlaceholderSettings from '@/pages/SettingsPage/PlaceholderSettings.jsx';
import PremiumSettings from '@/pages/SettingsPage/PremiumSettings.jsx';
import PremiumDashboard from '@/pages/PremiumDashboard/index';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: loadingAuth, initialized } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while auth is initializing
  if (loadingAuth || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only redirect to login if auth is initialized and user is not authenticated
  if (!currentUser) {
    return <Navigate to="/auth?action=login" state={{ from: location }} replace />;
  }

  return children;
};

const MainContent = ({ children }) => {
  return (
    <div className="flex-grow flex">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

// Helper function to wrap components with PageErrorBoundary
const withPageErrorBoundary = (Component, pageName) => {
  return (
    <PageErrorBoundary pageName={pageName}>
      <Component />
    </PageErrorBoundary>
  );
};


const AppRoutes = ({ currentUser }) => {
  const location = useLocation();

  return (
    <MainContent>
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={withPageErrorBoundary(HomePage, 'Ana Sayfa')}
        />
        <Route path="/auth" element={withPageErrorBoundary(AuthPage, 'Giriş/Kayıt')} />
        <Route path="/arama" element={withPageErrorBoundary(SearchResultsPage, 'Arama Sonuçları')} />

        <Route path="/ilan-olustur" element={<ProtectedRoute>{withPageErrorBoundary(CreateListingPage, 'İlan Oluştur')}</ProtectedRoute>} />
        <Route path="/teklif-yap/:listingId" element={<ProtectedRoute>{withPageErrorBoundary(MakeOfferPage, 'Teklif Yap')}</ProtectedRoute>} />
        <Route path="/sikayet-et/:listingId" element={<ProtectedRoute>{withPageErrorBoundary(ReportListingPage, 'Şikayet Et')}</ProtectedRoute>} />
        <Route path="/degerlendirme/:offerId" element={<ProtectedRoute>{withPageErrorBoundary(LeaveReviewPage, 'Değerlendirme')}</ProtectedRoute>} />
        <Route path="/ilan-duzenle/:listingId" element={<ProtectedRoute>{withPageErrorBoundary(EditListingPage, 'İlan Düzenle')}</ProtectedRoute>} />
        <Route path="/stok-gorsel-ara" element={<ProtectedRoute>{withPageErrorBoundary(StockImageSearchPage, 'Stok Görsel Ara')}</ProtectedRoute>} />
        <Route path="/kategori-takip-et" element={<ProtectedRoute>{withPageErrorBoundary(FollowCategoryPage, 'Kategori Takip Et')}</ProtectedRoute>} />
        <Route path="/ilan-kurallari" element={withPageErrorBoundary(ListingRulesPage, 'İlan Kuralları')} />
        <Route path="/doping/:listingId" element={<ProtectedRoute>{withPageErrorBoundary(DopingPage, 'Doping')}</ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute>{withPageErrorBoundary(PremiumPage, 'Premium')}</ProtectedRoute>} />
        <Route path="/guven-puani/:userId" element={withPageErrorBoundary(TrustScorePage, 'Güven Puanı')} />
        <Route path="/ilan-kaldir/:listingId" element={<ProtectedRoute>{withPageErrorBoundary(UnpublishListingPage, 'İlan Kaldır')}</ProtectedRoute>} />
        
        <Route 
          path="/profil/:userId" 
          element={withPageErrorBoundary(ProfilePage, 'Profil')}
        />
        <Route 
          path="/envanterim" 
          element={
            <ProtectedRoute>
              {withPageErrorBoundary(InventoryPage, 'Envanterim')}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ilanlarim" 
          element={
            <ProtectedRoute>
              {withPageErrorBoundary(MyListingsPage, 'İlanlarım')}
            </ProtectedRoute>
          } 
        />
        <Route path="/envanter/yeni" element={<ProtectedRoute>{withPageErrorBoundary(InventoryFormPage, 'Yeni Envanter')}</ProtectedRoute>} />
        <Route path="/envanter/duzenle/:itemId" element={<ProtectedRoute>{withPageErrorBoundary(InventoryFormPage, 'Envanter Düzenle')}</ProtectedRoute>} />

        <Route 
          path="/ilan/:listingId" 
          element={withPageErrorBoundary(ListingDetailPage, 'İlan Detayı')}
        />
        <Route 
          path="/gonderdigim-teklifler" 
          element={<ProtectedRoute>{withPageErrorBoundary(SentOffersPage, 'Gönderdiğim Teklifler')}</ProtectedRoute>} 
        />
        <Route 
          path="/aldigim-teklifler" 
          element={<ProtectedRoute>{withPageErrorBoundary(ReceivedOffersPage, 'Aldığım Teklifler')}</ProtectedRoute>} 
        />
        <Route path="/mesajlarim" element={<ProtectedRoute>{withPageErrorBoundary(ConversationsListPage, 'Mesajlarım')}</ProtectedRoute>} />
        <Route 
          path="/mesajlar/:conversationId" 
          element={<ProtectedRoute>{withPageErrorBoundary(ConversationPage, 'Mesajlaşma')}</ProtectedRoute>} 
        />
         <Route 
          path="/favorilerim" 
          element={<ProtectedRoute>{withPageErrorBoundary(FavoritesPage, 'Favorilerim')}</ProtectedRoute>} 
        />
        <Route 
          path="/takip-edilenler/:userId" 
          element={<ProtectedRoute>{withPageErrorBoundary(FollowingPage, 'Takip Edilenler')}</ProtectedRoute>} 
        />
        <Route 
          path="/takip-edilenler" 
          element={<ProtectedRoute>{withPageErrorBoundary(FollowingPage, 'Takip Edilenler')}</ProtectedRoute>} 
        />
        <Route path="/auth/callback" element={withPageErrorBoundary(AuthCallbackPage, 'Auth Callback')} />
        
        <Route 
          path="/premium-dashboard" 
          element={<ProtectedRoute>{withPageErrorBoundary(PremiumDashboard, 'Premium Dashboard')}</ProtectedRoute>} 
        />
        
        {/* Test route - sadece development modunda */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="/test-error" element={withPageErrorBoundary(ErrorTestComponent, 'Error Test')} />
        )}
        
        <Route path="/ayarlar" element={<ProtectedRoute>{withPageErrorBoundary(SettingsLayout, 'Ayarlar')}</ProtectedRoute>}>
          <Route index element={<Navigate to="profil" replace />} />
          <Route path="profil" element={withPageErrorBoundary(ProfileSettings, 'Profil Ayarları')} />
          <Route path="iletisim" element={withPageErrorBoundary(ContactSettings, 'İletişim Ayarları')} />
          <Route path="guvenlik" element={withPageErrorBoundary(SecuritySettings, 'Güvenlik Ayarları')} />
          <Route path="bildirimler" element={withPageErrorBoundary(NotificationSettings, 'Bildirim Ayarları')} />
          <Route path="platform" element={withPageErrorBoundary(PlatformSettings, 'Platform Ayarları')} />
          <Route path="hesap" element={withPageErrorBoundary(AccountSettings, 'Hesap Ayarları')} />
          <Route path="premium" element={withPageErrorBoundary(PremiumSettings, 'Premium Ayarları')} />
          <Route path="geribildirim" element={withPageErrorBoundary(FeedbackSection, 'Geribildirim')} />
          
          <Route path="sohbet" element={withPageErrorBoundary(() => <PlaceholderSettings title="Sohbet" />, 'Sohbet Ayarları')} />
          <Route path="istek-teklif" element={withPageErrorBoundary(() => <PlaceholderSettings title="İstek ve Teklif Yönetimi" />, 'İstek Teklif Ayarları')} />
          <Route path="odeme" element={withPageErrorBoundary(() => <PlaceholderSettings title="Fatura ve Ödemeler" />, 'Ödeme Ayarları')} />
          <Route path="gelistirici" element={withPageErrorBoundary(() => <PlaceholderSettings title="Geliştirici" />, 'Geliştirici Ayarları')} />
        </Route>

        <Route path="*" element={withPageErrorBoundary(NotFoundPage, '404')} />
      </Routes>
    </MainContent>
  );
};

export default AppRoutes;
