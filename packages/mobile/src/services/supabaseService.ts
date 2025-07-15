import { processImagesForSupabase } from './imageService';
import { 
    getOrCreateConversation as getOrCreateConversationService,
    fetchMessages as fetchMessagesService,
    sendMessage as sendMessageService,
    fetchConversationDetails as fetchConversationDetailsService,
    subscribeToMessages as subscribeToMessagesService
} from './conversationService';
import {
    createOffer as createOfferService,
    fetchSentOffers as fetchSentOffersService,
    fetchReceivedOffers as fetchReceivedOffersService,
    updateOfferStatus as updateOfferStatusService,
    deleteOffer as deleteOfferService
} from './offerService';
import {
    createReview as createReviewService,
    fetchUserReviews as fetchUserReviewsService,
    canUserReview as canUserReviewService
} from './reviewService';
import {
    createListingReport as createListingReportService
} from './reportService';
import {
    addFavorite as addFavoriteService,
    removeFavorite as removeFavoriteService,
    fetchUserFavoriteListings as fetchUserFavoriteListingsService,
    fetchUserFavoriteStatusForListings as fetchUserFavoriteStatusForListingsService
} from './favoriteService';
import {
    followUser as followUserService,
    unfollowUser as unfollowUserService,
    checkIfFollowing as checkIfFollowingService,
    fetchFollowingUsers as fetchFollowingUsersService,
    fetchFollowers as fetchFollowersService
} from './followService';
import {
    followCategory as followCategoryService,
    unfollowCategory as unfollowCategoryService,
    checkIfFollowingCategory as checkIfFollowingCategoryService,
    fetchFollowedCategories as fetchFollowedCategoriesService,
    fetchListingsForFollowedCategories as fetchListingsForFollowedCategoriesService
} from './categoryFollowService';
import {
    fetchListings as fetchListingsService,
    createListing as createListingService,
    updateListingStatus as updateListingStatusService,
    deleteListing as deleteListingService,
    fetchAttributeStatistics as fetchAttributeStatisticsService,
    searchByAttributeValues as searchByAttributeValuesService
} from './listingService';
import {
    fetchUserProfile as fetchUserProfileService
} from './profileService';
import {
    fetchInventoryItems as fetchInventoryItemsService,
    addInventoryItem as addInventoryItemService,
    updateInventoryItem as updateInventoryItemService,
    deleteInventoryItem as deleteInventoryItemService
} from './inventoryService';
import { supabase } from './supabaseClient';
import { User, UserProfile, AuthCredentials, RegisterData, ApiResponse } from '../types';
import { AuthenticationError, DatabaseError, ValidationError, handleError } from '../utils/errors';

export { 
    processImagesForSupabase,
    getOrCreateConversationService as getOrCreateConversation,
    fetchMessagesService as fetchMessages,
    sendMessageService as sendMessage,
    fetchConversationDetailsService as fetchConversationDetails,
    subscribeToMessagesService as subscribeToMessages,
    createOfferService as createOffer,
    fetchSentOffersService as fetchSentOffers,
    fetchReceivedOffersService as fetchReceivedOffers,
    updateOfferStatusService as updateOfferStatus,
    deleteOfferService as deleteOffer,
    createReviewService as createReview,
    fetchUserReviewsService as fetchUserReviews,
    canUserReviewService as canUserReview,
    createListingReportService as createListingReport,
    addFavoriteService as addFavorite,
    removeFavoriteService as removeFavorite,
    fetchUserFavoriteListingsService as fetchUserFavoriteListings,
    fetchUserFavoriteStatusForListingsService as fetchUserFavoriteStatusForListings,
    followUserService as followUser,
    unfollowUserService as unfollowUser,
    checkIfFollowingService as checkIfFollowing,
    fetchFollowingUsersService as fetchFollowingUsers,
    fetchFollowersService as fetchFollowers,
    followCategoryService as followCategory,
    unfollowCategoryService as unfollowCategory,
    checkIfFollowingCategoryService as checkIfFollowingCategory,
    fetchFollowedCategoriesService as fetchFollowedCategories,
    fetchListingsForFollowedCategoriesService as fetchListingsForFollowedCategories,
    fetchListingsService as fetchListings,
    createListingService as createListing,
    updateListingStatusService as updateListingStatus,
    deleteListingService as deleteListing,
    fetchAttributeStatisticsService as fetchAttributeStatistics,
    searchByAttributeValuesService as searchByAttributeValues,
    fetchUserProfileService as fetchUserProfile,
    fetchInventoryItemsService as fetchInventoryItems,
    addInventoryItemService as addInventoryItem,
    updateInventoryItemService as updateInventoryItem,
    deleteInventoryItemService as deleteInventoryItem
};

export const signIn = async (credentials: AuthCredentials): Promise<ApiResponse<User>> => {
  try {
    if (!credentials.email || !credentials.password) {
      throw new ValidationError('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new AuthenticationError('Invalid email or password', error);
    }

    if (!data.user) {
      throw new AuthenticationError('No user data returned');
    }

    return { data: data.user as User };
  } catch (error) {
    console.error('Error in signIn:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export const signUp = async (registerData: RegisterData): Promise<ApiResponse<User>> => {
  try {
    if (!registerData.email || !registerData.password || !registerData.username) {
      throw new ValidationError('Email, password and username are required');
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          username: registerData.username,
        },
      },
    });

    if (error) {
      throw new AuthenticationError('Registration failed', error);
    }

    if (!data.user) {
      throw new AuthenticationError('No user data returned');
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: registerData.email,
          username: registerData.username,
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      throw new DatabaseError('Failed to create user profile', profileError);
    }

    return { data: data.user as User };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export const signOut = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AuthenticationError('Failed to sign out', error);
    }

    return { data: true };
  } catch (error) {
    console.error('Error in signOut:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User | null>> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new AuthenticationError('Failed to get current user', error);
    }

    return { data: session?.user || null };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
};

export const resetPassword = async (email: string): Promise<ApiResponse<boolean>> => {
  try {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new AuthenticationError('Failed to send password reset email', error);
    }

    return { data: true };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export const updatePassword = async (newPassword: string): Promise<ApiResponse<boolean>> => {
  try {
    if (!newPassword) {
      throw new ValidationError('New password is required');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new AuthenticationError('Failed to update password', error);
    }

    return { data: true };
  } catch (error) {
    console.error('Error in updatePassword:', error);
    return { error: handleError(error).toJSON().error };
  }
};

export { supabase };



export const getUserReviews = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return { data: null, error };
  }
};

export const subscribeToMessagesChannel = (channelId: string, callback: (message: any) => void) => {
  const subscription = supabase
    .channel(`messages:${channelId}`)
    .on('INSERT', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}; 