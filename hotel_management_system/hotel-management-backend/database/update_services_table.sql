-- Update services table structure
USE hotel_management_system;

-- Add category column if it doesn't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Other';

-- Update existing services with appropriate categories
UPDATE services SET category = 'Food' WHERE service_name LIKE '%Room Service%' OR service_name LIKE '%Restaurant%';
UPDATE services SET category = 'Laundry' WHERE service_name LIKE '%Laundry%';
UPDATE services SET category = 'Spa' WHERE service_name LIKE '%Spa%';
UPDATE services SET category = 'Transport' WHERE service_name LIKE '%Airport%';

-- Rename status column to availability_status if needed
-- First check if we need to rename
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'hotel_management_system' 
                   AND TABLE_NAME = 'services' 
                   AND COLUMN_NAME = 'availability_status');

-- If availability_status doesn't exist, we'll work with status column
-- Update the ENUM values in status column to match what frontend expects
ALTER TABLE services MODIFY COLUMN status ENUM('Available', 'Unavailable', 'Active', 'Inactive') DEFAULT 'Available';

-- Update existing status values
UPDATE services SET status = 'Available' WHERE status = 'Active';
UPDATE services SET status = 'Unavailable' WHERE status = 'Inactive';

-- Now alter to only have the new values
ALTER TABLE services MODIFY COLUMN status ENUM('Available', 'Unavailable') DEFAULT 'Available';

SELECT 'Services table updated successfully!' AS message;
