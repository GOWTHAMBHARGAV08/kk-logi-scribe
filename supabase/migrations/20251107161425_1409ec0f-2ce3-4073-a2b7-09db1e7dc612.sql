-- Create trips table for storing all trip and expense records
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  trip_id TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  fuel DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (fuel >= 0),
  driver_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (driver_fee >= 0),
  handling_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (handling_fee >= 0),
  tolls DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tolls >= 0),
  petty_cash DECIMAL(10,2) DEFAULT 0 CHECK (petty_cash >= 0),
  pc_note TEXT,
  other_expenses DECIMAL(10,2) DEFAULT 0 CHECK (other_expenses >= 0),
  other_expenses_description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_date ON public.trips(date);
CREATE INDEX idx_trips_trip_id ON public.trips(trip_id);
CREATE INDEX idx_trips_vehicle ON public.trips(vehicle);