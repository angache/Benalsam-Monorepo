import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { addUserActivity } from '@/services/userActivityService';

// Error handling helper
const handleError = (error, title = "Hata", description = "Bir sorun oluştu") => {
  console.error(`Error in ${title}:`, error);
  toast({ 
    title: title, 
    description: error?.message || description, 
    variant: "destructive" 
  });
  return null;
};

// Validation helper
const validateConversationData = (user1Id, user2Id) => {
  if (!user1Id || !user2Id) {
    console.error('Missing user IDs for conversation');
    return false;
  }
  return true;
};

export const getOrCreateConversation = async (user1Id, user2Id, offerId = null, listingId = null) => {
  if (!validateConversationData(user1Id, user2Id)) {
    return null;
  }

  try {
    const { data: existingConversation, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .eq('offer_id', offerId)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error searching for existing conversation:', searchError);
      return null;
    }

    if (existingConversation) {
      return existingConversation.id;
    }

    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        offer_id: offerId,
        listing_id: listingId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      return handleError(createError, "Sohbet Oluşturulamadı", createError.message);
    }

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: user1Id },
        { conversation_id: newConversation.id, user_id: user2Id }
      ]);

    if (participantError) {
      console.error('Error adding conversation participants:', participantError);
    }

    return newConversation.id;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Sohbet oluşturulurken bir sorun oluştu");
  }
};

export const sendMessage = async (conversationId, senderId, content, messageType = 'text') => {
  if (!conversationId || !senderId || !content) {
    return handleError(null, "Hata", "Mesaj göndermek için eksik bilgi");
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        message_type: messageType,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        sender:profiles!sender_id(id, name, avatar_url)
      `)
      .single();

    if (error) {
      return handleError(error, "Mesaj Gönderilemedi", error.message);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    // Add user activity
    await addUserActivity(
      senderId,
      'message_sent',
      'Mesaj gönderildi',
      'Yeni bir mesaj gönderildi',
      data.id
    );

    return data;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Mesaj gönderilirken bir sorun oluştu");
  }
};

export const fetchMessages = async (conversationId, limit = 50) => {
  if (!conversationId) return [];

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMessages:', error);
    return [];
  }
};

export const fetchConversationDetails = async (conversationId) => {
  if (!conversationId) return null;

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          user_id,
          profiles(id, name, avatar_url)
        ),
        listings(id, title, user_id),
        offers:offers!conversations_offer_id_fkey(
          id, 
          status,
          inventory_items(id, name, main_image_url)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation details:', error);
      if (error.code === 'PGRST201') {
         toast({ title: "Sohbet Detayları Yüklenemedi", description: "Veritabanı ilişkilerinde bir sorun var. Lütfen daha sonra tekrar deneyin.", variant: "destructive" });
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchConversationDetails:', error);
    return [];
  }
};

export const getUserConversations = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:profiles!conversations_user1_id_fkey(id, name, avatar_url),
        user2:profiles!conversations_user2_id_fkey(id, name, avatar_url),
        listing:listings!conversations_listing_id_fkey(id, title),
        offer:offers!conversations_offer_id_fkey(id, status),
        last_message:messages(content, created_at, sender_id, is_read)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { foreignTable: 'messages', ascending: false })
      .limit(1, { foreignTable: 'messages' })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
    
    const formattedData = data.map(conv => ({
      ...conv,
      last_message: Array.isArray(conv.last_message) ? conv.last_message[0] : conv.last_message,
    }));

    return formattedData || [];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
};

export const markMessagesAsRead = async (conversationId, userId) => {
  if (!conversationId || !userId) return false;

  try {
    const { error } = await supabase
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return false;
  }
};

export const subscribeToMessages = (conversationId, onNewMessage) => {
  if (!conversationId || !onNewMessage) return null;

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        const { data: messageWithSender, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(id, name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && messageWithSender) {
          onNewMessage(messageWithSender);
        }
      }
    )
    .subscribe();

  return channel;
};

export const subscribeToMessageStatusChanges = (conversationId, onStatusUpdate) => {
  if (!conversationId || !onStatusUpdate) return null;

  const channel = supabase
    .channel(`message_status:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onStatusUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
};

export const getTotalUnreadMessages = async (userId) => {
  if (!userId) return { count: 0, error: null };
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .eq('is_read', false);
  
  return { count: count || 0, error };
};

export const getUnreadMessageCounts = async (userId) => {
  if (!userId) return {};
  
  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id')
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread message counts:', error);
    return {};
  }

  const counts = data.reduce((acc, msg) => {
    acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
    return acc;
  }, {});

  return counts;
};