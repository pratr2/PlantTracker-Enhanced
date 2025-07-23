/*
  # Add missing columns to plants table

  1. New Columns
    - `species` (text) - Plant species information
    - `image_url` (text) - URL for plant image
    - `date_acquired` (date) - When the plant was acquired
    - `watering_frequency` (integer) - Days between watering
    - `fertilizing_frequency` (integer) - Days between fertilizing
    - `repotting_frequency` (integer) - Days between repotting
    - `last_watered` (date) - Last watering date
    - `last_fertilized` (date) - Last fertilization date
    - `last_repotted` (date) - Last repotting date
    - `health_status` (text) - Current health status
    - `care_instructions` (text) - Care instructions

  2. Changes
    - Add all missing columns that the edge function expects
    - Set appropriate default values where needed
*/

-- Add missing columns to plants table
DO $$
BEGIN
  -- Add species column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'species'
  ) THEN
    ALTER TABLE plants ADD COLUMN species text;
  END IF;

  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE plants ADD COLUMN image_url text;
  END IF;

  -- Add date_acquired column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'date_acquired'
  ) THEN
    ALTER TABLE plants ADD COLUMN date_acquired date DEFAULT CURRENT_DATE;
  END IF;

  -- Add watering_frequency column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'watering_frequency'
  ) THEN
    ALTER TABLE plants ADD COLUMN watering_frequency integer DEFAULT 7;
  END IF;

  -- Add fertilizing_frequency column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'fertilizing_frequency'
  ) THEN
    ALTER TABLE plants ADD COLUMN fertilizing_frequency integer DEFAULT 30;
  END IF;

  -- Add repotting_frequency column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'repotting_frequency'
  ) THEN
    ALTER TABLE plants ADD COLUMN repotting_frequency integer DEFAULT 365;
  END IF;

  -- Add last_watered column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'last_watered'
  ) THEN
    ALTER TABLE plants ADD COLUMN last_watered date;
  END IF;

  -- Add last_fertilized column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'last_fertilized'
  ) THEN
    ALTER TABLE plants ADD COLUMN last_fertilized date;
  END IF;

  -- Add last_repotted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'last_repotted'
  ) THEN
    ALTER TABLE plants ADD COLUMN last_repotted date;
  END IF;

  -- Add health_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'health_status'
  ) THEN
    ALTER TABLE plants ADD COLUMN health_status text DEFAULT 'healthy';
  END IF;

  -- Add care_instructions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'care_instructions'
  ) THEN
    ALTER TABLE plants ADD COLUMN care_instructions text;
  END IF;
END $$;