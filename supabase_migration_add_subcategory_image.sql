-- Add image_url column to subcategories table
ALTER TABLE public.subcategories
ADD COLUMN image_url TEXT;

-- Update existing subcategories with default image if needed
-- (optional, can be set individually through the admin panel)
