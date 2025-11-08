-- Add revenue field to trips table
ALTER TABLE public.trips 
ADD COLUMN revenue DECIMAL(10,2) DEFAULT 0 NOT NULL;