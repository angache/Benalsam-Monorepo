
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext.jsx';

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
  const { currentUser, loadingAuth } = useAppContext();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth?action=login" state={{ from: location }} replace />;
  }

  return children;
};

const MainContent = ({ children }) => {
  const location = useLocation();
  const showSidebarAd = !['/', '/auth', '/ilan-olustur'].includes(location.pathname) && !location.pathname.startsWith('/mesajlar');

  return (
    <div className="flex-grow flex">
      <main className="flex-grow">
        {children}
      </main>
      {showSidebarAd && (
        <aside className="hidden lg:block w-72 flex-shrink-0 p-6">
          <div className="sticky top-24">
            <AdBanner placement="sidebar" />
          </div>
        </aside>
      )}
    </div>
  );
};


const AppRoutes = ({
  listings,
  setListings,
  onToggleFavorite,
  inventoryItems, 
  loadInitialData, 
}) => {
  const location = useLocation();
  const { currentUser } = useAppContext();

  return (
    <MainContent>
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <HomePage 
              listings={listings} 
              setListings={setListings} 
              onToggleFavorite={onToggleFavorite}
              currentUser={currentUser}
            />
          } 
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/arama" element={<SearchResultsPage onToggleFavorite={onToggleFavorite} />} />

        <Route path="/ilan-olustur" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
        <Route path="/teklif-yap/:listingId" element={<ProtectedRoute><MakeOfferPage /></ProtectedRoute>} />
        <Route path="/sikayet-et/:listingId" element={<ProtectedRoute><ReportListingPage /></ProtectedRoute>} />
        <Route path="/degerlendirme/:offerId" element={<ProtectedRoute><LeaveReviewPage onReviewSubmitted={loadInitialData} /></ProtectedRoute>} />
        <Route path="/ilan-duzenle/:listingId" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
        <Route path="/stok-gorsel-ara" element={<ProtectedRoute><StockImageSearchPage /></ProtectedRoute>} />
        <Route path="/kategori-takip-et" element={<ProtectedRoute><FollowCategoryPage /></ProtectedRoute>} />
        <Route path="/ilan-kurallari" element={<ListingRulesPage />} />
        <Route path="/doping/:listingId" element={<ProtectedRoute><DopingPage /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />
        <Route path="/guven-puani/:userId" element={<TrustScorePage />} />
        <Route path="/ilan-kaldir/:listingId" element={<ProtectedRoute><UnpublishListingPage /></ProtectedRoute>} />
        
        <Route 
          path="/profil/:userId" 
          element={
            <ProfilePage />
          } 
        />
        <Route 
          path="/envanterim" 
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ilanlarim" 
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/envanter/yeni" element={<ProtectedRoute><InventoryFormPage /></ProtectedRoute>} />
        <Route path="/envanter/duzenle/:itemId" element={<ProtectedRoute><InventoryFormPage /></ProtectedRoute>} />

        <Route 
          path="/ilan/:listingId" 
          element={
            <ListingDetailPage 
              setListings={setListings} 
              onToggleFavorite={onToggleFavorite}
            />
          } 
        />
        <Route 
          path="/gonderdigim-teklifler" 
          element={<ProtectedRoute><SentOffersPage /></ProtectedRoute>} 
        />
        <Route 
          path="/aldigim-teklifler" 
          element={<ProtectedRoute><ReceivedOffersPage /></ProtectedRoute>} 
        />
        <Route path="/mesajlarim" element={<ProtectedRoute><ConversationsListPage /></ProtectedRoute>} />
        <Route 
          path="/mesajlar/:conversationId" 
          element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} 
        />
         <Route 
          path="/favorilerim" 
          element={<ProtectedRoute><FavoritesPage onToggleFavorite={onToggleFavorite} /></ProtectedRoute>} 
        />
        <Route 
          path="/takip-edilenler/:userId" 
          element={<ProtectedRoute><FollowingPage onToggleFavorite={onToggleFavorite} /></ProtectedRoute>} 
        />
        <Route 
          path="/takip-edilenler" 
          element={<ProtectedRoute><FollowingPage onToggleFavorite={onToggleFavorite}/></ProtectedRoute>} 
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        <Route 
          path="/premium-dashboard" 
          element={<ProtectedRoute><PremiumDashboard /></ProtectedRoute>} 
        />
        
        <Route path="/ayarlar" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="profil" replace />} />
          <Route path="profil" element={<ProfileSettings />} />
          <Route path="iletisim" element={<ContactSettings />} />
          <Route path="guvenlik" element={<SecuritySettings />} />
          <Route path="bildirimler" element={<NotificationSettings />} />
          <Route path="platform" element={<PlatformSettings />} />
          <Route path="hesap" element={<AccountSettings />} />
          <Route path="premium" element={<PremiumSettings />} />
          <Route path="geribildirim" element={<FeedbackSection />} />
          
          <Route path="sohbet" element={<PlaceholderSettings title="Sohbet" />} />
          <Route path="istek-teklif" element={<PlaceholderSettings title="İstek ve Teklif Yönetimi" />} />
          <Route path="odeme" element={<PlaceholderSettings title="Fatura ve Ödemeler" />} />
          <Route path="gelistirici" element={<PlaceholderSettings title="Geliştirici" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainContent>
  );
};

export default AppRoutes;
