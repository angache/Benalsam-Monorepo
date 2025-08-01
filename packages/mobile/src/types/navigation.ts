import { NavigationProp, RouteProp } from '@react-navigation/native';
import type { NotificationPreferences, ChatPreferences } from './index';

export type RootStackParamList = {
  MainTabs: undefined;
  ListingDetail: { listingId: string };
  ProfileScreen: undefined;
  PublicProfile: { userId: string };
  MyListings: undefined;
  EditListing: { id: string };
  Messages: undefined;
  Conversation: { conversationId: string };
  Settings: undefined;
  EditProfile: undefined;
  NotificationPreferences: {
    preferences: NotificationPreferences | undefined;
    onUpdate: (preferences: NotificationPreferences) => void;
  };
  ChatPreferences: {
    preferences: ChatPreferences | undefined;
    onUpdate: (preferences: ChatPreferences) => void;
  };
  Security: undefined;
  Privacy: undefined;
  BlockedUsers: undefined;
  Inventory: undefined;
  InventoryForm: { itemId?: string };
  StockImageSearch: undefined;
  Following: undefined;
  FollowCategory: undefined;
  MakeOffer: { listingId: string };
  ReceivedOffers: undefined;
  SentOffers: undefined;
  Login: undefined;
  Register: undefined;
  Auth: undefined;
  AppSettings: undefined;
  Support: undefined;
  About: undefined;
  Help: undefined;
  Contact: undefined;
  Feedback: undefined;
  TrustScore: { userId: string | undefined };
  Reviews: undefined;
  Premium: undefined;
  Doping: undefined;
  ListingRules: undefined;
  ReportListing: { id: string };
  UnpublishListing: { id: string };
  LeaveReview: { id: string };
  SelectProvince: undefined;
  SelectDistrict: { provinceCode: string };
  SelectProvinceDistrict: undefined;
  CreateListing: undefined;
  CreateListingMethod: undefined;
  CreateListingCategory: undefined;
  CreateListingDetails: undefined;
  CreateListingImages: undefined;
  CreateListingLocation: undefined;
  CreateListingConfirm: undefined;
  AIGenerateListing: undefined;
  FirebaseTest: undefined;
  FCMTest: undefined;
  Moderation: undefined;
  AnalyticsDashboard: undefined;
  AnalyticsTest: undefined;
  ElasticsearchTest: undefined;
  TwoFactorSetup: undefined;
  TwoFactorVerify: {
    userId: string;
    onSuccess?: () => void;
  };
};

export type NavigationProps = {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, keyof RootStackParamList>;
}; 