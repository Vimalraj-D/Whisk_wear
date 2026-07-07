-- Migration: Add code_expires_at column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE;
