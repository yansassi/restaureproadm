/*
  # Create customers table for image restoration requests

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
      - `customer_name` (text, not null)
      - `customer_email` (text, not null)
      - `customer_phone` (text, optional)
      - `original_image_url` (text, not null)
      - `restored_image_url` (text, optional)
      - `status` (text, default 'pending')
      - `notes` (text, optional)

  2. Security
    - Enable RLS on `customers` table
    - Add policy for public read access (for admin panel)
    - Add policy for public insert access (for customer submissions)
    - Add policy for public update access (for status updates)

  3. Indexes
    - Index on status for filtering
    - Index on created_at for sorting
    - Index on customer_email for searching
*/

-- Create the customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  original_image_url text NOT NULL,
  restored_image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes text
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin panel)
CREATE POLICY "Allow public read access"
  ON customers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON customers
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON customers
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(customer_email);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();