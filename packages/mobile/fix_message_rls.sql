-- Fix RLS policy for messages table to allow conversation participants to send messages
-- This fixes the error when users try to send messages from received offers

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in conversations they participate" ON messages;
DROP POLICY IF EXISTS "Allow message creation for conversation participants" ON messages;

-- Create new comprehensive policy for message creation using both participants and conversations
CREATE POLICY "Allow message creation for conversation participants" ON messages
FOR INSERT
WITH CHECK (
  (
    -- Check conversation_participants table first
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = conversation_id 
      AND conversation_participants.user_id = auth.uid()
    )
    OR
    -- Fallback to conversations table for newly created conversations
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (
        conversations.user1_id = auth.uid() 
        OR conversations.user2_id = auth.uid()
      )
    )
  )
  AND sender_id = auth.uid()
);

-- Also ensure users can read messages from conversations they participate in
DROP POLICY IF EXISTS "Users can read messages from their conversations" ON messages;

CREATE POLICY "Users can read messages from their conversations" ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (
      conversations.user1_id = auth.uid() 
      OR conversations.user2_id = auth.uid()
    )
  )
);

-- Update policy for message updates (for read status, etc.)
DROP POLICY IF EXISTS "Users can update message status in their conversations" ON messages;

CREATE POLICY "Users can update message status in their conversations" ON messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (
      conversations.user1_id = auth.uid() 
      OR conversations.user2_id = auth.uid()
    )
  )
);

-- Ensure conversations table has proper RLS policies
DROP POLICY IF EXISTS "Users can read their own conversations" ON conversations;

CREATE POLICY "Users can read their own conversations" ON conversations
FOR SELECT
USING (
  user1_id = auth.uid() 
  OR user2_id = auth.uid()
);

-- Allow users to create conversations
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT
WITH CHECK (
  user1_id = auth.uid() 
  OR user2_id = auth.uid()
);

-- Allow users to update conversation metadata (last_message_at, etc.)
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

CREATE POLICY "Users can update their conversations" ON conversations
FOR UPDATE
USING (
  user1_id = auth.uid() 
  OR user2_id = auth.uid()
);

-- Ensure conversation_participants table has proper RLS policies
DROP POLICY IF EXISTS "Users can read conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON conversation_participants;

CREATE POLICY "Users can read conversation participants" ON conversation_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert conversation participants" ON conversation_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Offers tablosuna inventory_item_id sütunu ekle
ALTER TABLE offers ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id);

-- Offers tablosundaki foreign key ilişkilerini güncelle
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_inventory_item_id_fkey;
ALTER TABLE offers ADD CONSTRAINT offers_inventory_item_id_fkey 
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL; 