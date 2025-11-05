-- Hotel Management System - Stored Procedures
USE hotel_management_system;

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS GetAvailableRooms;
DROP PROCEDURE IF EXISTS CalculateRevenue;
DROP PROCEDURE IF EXISTS GetCustomerBookingHistory;
DROP PROCEDURE IF EXISTS GetRoomOccupancyRate;
DROP PROCEDURE IF EXISTS GetTopCustomers;
DROP PROCEDURE IF EXISTS CheckRoomAvailability;

-- =====================================================
-- Procedure 1: Get Available Rooms for a date range
-- =====================================================
DELIMITER $$
CREATE PROCEDURE GetAvailableRooms(
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_room_type VARCHAR(50)
)
BEGIN
    SELECT 
        r.room_id,
        r.room_number,
        r.room_type,
        r.price_per_night,
        r.floor_number,
        r.description,
        r.status
    FROM rooms r
    WHERE r.status = 'Available'
    AND (p_room_type IS NULL OR r.room_type = p_room_type)
    AND r.room_id NOT IN (
        SELECT room_id 
        FROM bookings 
        WHERE status IN ('Confirmed', 'Checked-in')
        AND (
            (check_in <= p_check_in AND check_out > p_check_in)
            OR (check_in < p_check_out AND check_out >= p_check_out)
            OR (check_in >= p_check_in AND check_out <= p_check_out)
        )
    )
    ORDER BY r.price_per_night;
END$$
DELIMITER ;

-- =====================================================
-- Procedure 2: Calculate Revenue for a date range
-- =====================================================
DELIMITER $$
CREATE PROCEDURE CalculateRevenue(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        DATE(p.payment_date) as payment_day,
        COUNT(DISTINCT p.booking_id) as total_bookings,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as average_payment,
        COUNT(CASE WHEN p.payment_method = 'Cash' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN p.payment_method = 'Card' THEN 1 END) as card_payments,
        COUNT(CASE WHEN p.payment_method = 'UPI' THEN 1 END) as upi_payments
    FROM payments p
    WHERE DATE(p.payment_date) BETWEEN p_start_date AND p_end_date
    AND p.status = 'Completed'
    GROUP BY DATE(p.payment_date)
    ORDER BY payment_day DESC;
END$$
DELIMITER ;

-- =====================================================
-- Procedure 3: Get Customer Booking History
-- =====================================================
DELIMITER $$
CREATE PROCEDURE GetCustomerBookingHistory(
    IN p_customer_id INT
)
BEGIN
    SELECT 
        b.booking_id,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.status,
        r.room_number,
        r.room_type,
        DATEDIFF(b.check_out_date, b.check_in_date) as nights_stayed,
        COALESCE(SUM(p.amount), 0) as total_paid,
        (b.total_amount - COALESCE(SUM(p.amount), 0)) as balance_due
    FROM bookings b
    JOIN rooms r ON b.room_id = r.room_id
    LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.status = 'Completed'
    WHERE b.customer_id = p_customer_id
    GROUP BY b.booking_id, b.check_in_date, b.check_out_date, b.total_amount, 
             b.status, r.room_number, r.room_type
    ORDER BY b.check_in_date DESC;
END$$
DELIMITER ;

-- =====================================================
-- Procedure 4: Get Room Occupancy Rate
-- =====================================================
DELIMITER $$
CREATE PROCEDURE GetRoomOccupancyRate(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    DECLARE total_rooms INT;
    DECLARE total_days INT;
    
    SELECT COUNT(*) INTO total_rooms FROM rooms;
    SET total_days = DATEDIFF(p_end_date, p_start_date) + 1;
    
    SELECT 
        r.room_type,
        COUNT(DISTINCT r.room_id) as total_rooms_of_type,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        SUM(DATEDIFF(b.check_out_date, b.check_in_date)) as total_nights_booked,
        ROUND(
            (SUM(DATEDIFF(b.check_out_date, b.check_in_date)) * 100.0) / 
            (COUNT(DISTINCT r.room_id) * total_days),
            2
        ) as occupancy_rate_percentage
    FROM rooms r
    LEFT JOIN bookings b ON r.room_id = b.room_id 
        AND b.status IN ('Confirmed', 'Checked-In', 'Checked-Out')
        AND b.check_in_date <= p_end_date 
        AND b.check_out_date >= p_start_date
    GROUP BY r.room_type
    
    UNION ALL
    
    SELECT 
        'OVERALL' as room_type,
        total_rooms,
        COUNT(DISTINCT b.booking_id),
        SUM(DATEDIFF(b.check_out_date, b.check_in_date)),
        ROUND(
            (SUM(DATEDIFF(b.check_out_date, b.check_in_date)) * 100.0) / 
            (total_rooms * total_days),
            2
        )
    FROM bookings b
    WHERE b.status IN ('Confirmed', 'Checked-In', 'Checked-Out')
        AND b.check_in_date <= p_end_date 
        AND b.check_out_date >= p_start_date;
END$$
DELIMITER ;

-- =====================================================
-- Procedure 5: Get Top Customers by Revenue
-- =====================================================
DELIMITER $$
CREATE PROCEDURE GetTopCustomers(
    IN p_limit INT
)
BEGIN
    SELECT 
        c.customer_id,
        c.full_name,
        c.email,
        c.phone,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        AVG(b.total_amount) as average_booking_value,
        MAX(b.check_in_date) as last_visit_date,
        DATEDIFF(CURDATE(), MAX(b.check_in_date)) as days_since_last_visit
    FROM customers c
    JOIN bookings b ON c.customer_id = b.customer_id
    WHERE b.status IN ('Confirmed', 'Checked-In', 'Checked-Out')
    GROUP BY c.customer_id, c.full_name, c.email, c.phone
    ORDER BY total_spent DESC
    LIMIT p_limit;
END$$
DELIMITER ;

-- =====================================================
-- Procedure 6: Check Room Availability (Returns boolean)
-- =====================================================
DELIMITER $$
CREATE PROCEDURE CheckRoomAvailability(
    IN p_room_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    OUT p_is_available BOOLEAN
)
BEGIN
    DECLARE conflict_count INT;
    
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE room_id = p_room_id
    AND status IN ('Confirmed', 'Checked-In')
    AND (
        (check_in_date <= p_check_in AND check_out_date > p_check_in)
        OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
        OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    );
    
    SET p_is_available = (conflict_count = 0);
    
    SELECT 
        p_is_available as is_available,
        conflict_count as conflicting_bookings,
        CASE 
            WHEN p_is_available THEN 'Room is available'
            ELSE CONCAT('Room has ', conflict_count, ' conflicting booking(s)')
        END as message;
END$$
DELIMITER ;

-- =====================================================
-- Display all created procedures
-- =====================================================
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    DTD_IDENTIFIER as RETURN_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'hotel_management_system'
AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

SELECT 'Stored procedures created successfully!' AS message;
