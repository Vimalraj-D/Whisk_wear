-- Migration: Add user_id column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
