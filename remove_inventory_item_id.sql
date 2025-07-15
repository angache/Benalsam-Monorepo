-- Remove the unnecessary inventory_item_id column from offers table
-- This column was added by mistake and we should use offered_item_id instead

-- Drop the foreign key constraint first
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_inventory_item_id_fkey;

-- Drop the column
ALTER TABLE offers DROP COLUMN IF EXISTS inventory_item_id;

-- Verify the table structure
-- The offers table should only have: offered_item_id (not inventory_item_id) 