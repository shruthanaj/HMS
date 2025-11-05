-- Hotel Management System - Database Triggers
USE hotel_management_system;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_room_status_on_booking;
DROP TRIGGER IF EXISTS restore_room_status_on_checkout;
DROP TRIGGER IF EXISTS calculate_loyalty_points_on_payment;
DROP TRIGGER IF EXISTS log_staff_changes;
DROP TRIGGER IF EXISTS update_booking_total_on_service;

-- =====================================================
-- Trigger 1: Auto-update room status when booking is created
-- =====================================================
DELIMITER $$
CREATE TRIGGER update_room_status_on_booking
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    -- Update room status to 'Occupied' when a new booking is created
    IF NEW.status = 'Confirmed' THEN
        UPDATE rooms 
        SET status = 'Occupied' 
        WHERE room_id = NEW.room_id;
    END IF;
    
    -- If booking is immediately checked in
    IF NEW.status = 'Checked-in' THEN
        UPDATE rooms 
        SET status = 'Occupied' 
        WHERE room_id = NEW.room_id;
    END IF;
END$$
DELIMITER ;

-- =====================================================
-- Trigger 2: Auto-restore room status when booking is checked out
-- =====================================================
DELIMITER $$
CREATE TRIGGER restore_room_status_on_checkout
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    -- When booking status changes to 'Checked-Out', make room available
    IF NEW.status = 'Checked-Out' AND OLD.status != 'Checked-Out' THEN
        UPDATE rooms 
        SET status = 'Available' 
        WHERE room_id = NEW.room_id;
    END IF;
    
    -- When booking status changes to 'Cancelled', make room available
    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        UPDATE rooms 
        SET status = 'Available' 
        WHERE room_id = NEW.room_id;
    END IF;
    
    -- When booking status changes to 'Checked-In', make room occupied
    IF NEW.status = 'Checked-In' AND OLD.status != 'Checked-In' THEN
        UPDATE rooms 
        SET status = 'Occupied' 
        WHERE room_id = NEW.room_id;
    END IF;
END$$
DELIMITER ;

-- =====================================================
-- Trigger 3: Calculate and award loyalty points on payment
-- =====================================================
DELIMITER $$
CREATE TRIGGER calculate_loyalty_points_on_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE customer_id_var INT;
    DECLARE points_to_add INT;
    
    -- Get customer ID from booking
    SELECT customer_id INTO customer_id_var
    FROM bookings
    WHERE booking_id = NEW.booking_id;
    
    -- Calculate loyalty points (1 point per ₹100 spent)
    SET points_to_add = FLOOR(NEW.amount / 100);
    
    -- Add loyalty points to customer (you'll need to add this column)
    -- For now, we'll skip this if column doesn't exist
    -- UPDATE customers SET loyalty_points = COALESCE(loyalty_points, 0) + points_to_add WHERE customer_id = customer_id_var;
END$$
DELIMITER ;

-- =====================================================
-- Trigger 4: Create audit log for staff changes
-- =====================================================
-- First, create audit log table
CREATE TABLE IF NOT EXISTS staff_audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE'),
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$
CREATE TRIGGER log_staff_changes
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    INSERT INTO staff_audit_log (staff_id, action_type, old_values, new_values, changed_by)
    VALUES (
        NEW.staff_id,
        'UPDATE',
        JSON_OBJECT(
            'full_name', OLD.full_name,
            'email', OLD.email,
            'role', OLD.role,
            'status', OLD.status,
            'salary', OLD.salary
        ),
        JSON_OBJECT(
            'full_name', NEW.full_name,
            'email', NEW.email,
            'role', NEW.role,
            'status', NEW.status,
            'salary', NEW.salary
        ),
        USER()
    );
END$$
DELIMITER ;

-- =====================================================
-- Trigger 5: Auto-calculate booking total when service is added
-- =====================================================
DELIMITER $$
CREATE TRIGGER update_booking_total_on_service
AFTER INSERT ON booking_services
FOR EACH ROW
BEGIN
    DECLARE current_total DECIMAL(10,2);
    
    -- Get current booking total
    SELECT total_amount INTO current_total
    FROM bookings
    WHERE booking_id = NEW.booking_id;
    
    -- Add service price to booking total
    UPDATE bookings 
    SET total_amount = current_total + NEW.total_price
    WHERE booking_id = NEW.booking_id;
END$$
DELIMITER ;

-- =====================================================
-- Display all created triggers
-- =====================================================
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'hotel_management_system'
ORDER BY EVENT_OBJECT_TABLE, ACTION_TIMING;

SELECT 'Database triggers created successfully!' AS message;
