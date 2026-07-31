-- SQL Migration: Add shipping_charge column to public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
