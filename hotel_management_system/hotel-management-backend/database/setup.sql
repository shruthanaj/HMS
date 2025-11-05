-- Hotel Management System Database Setup
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS hotel_management_system;
USE hotel_management_system;

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('Super Admin', 'Admin', 'Manager', 'Receptionist') DEFAULT 'Receptionist',
    salary DECIMAL(10, 2),
    hire_date DATE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Admin User
-- Username: admin
-- Password: admin123
INSERT INTO staff (username, password, full_name, email, phone, role, salary, hire_date, status) 
VALUES ('admin', 'admin123', 'Rajesh Kumar', 'rajesh.kumar@hotel.com', '9876543210', 'Super Admin', 50000.00, CURDATE(), 'Active')
ON DUPLICATE KEY UPDATE 
    full_name = 'Rajesh Kumar',
    email = 'rajesh.kumar@hotel.com',
    phone = '9876543210';

-- Insert Test Users
INSERT INTO staff (username, password, full_name, email, phone, role, salary, hire_date, status) 
VALUES 
('manager', 'manager123', 'Kavya Reddy', 'kavya.reddy@hotel.com', '9876543211', 'Manager', 40000.00, CURDATE(), 'Active'),
('receptionist', 'recept123', 'Priya Shetty', 'priya.shetty@hotel.com', '9876543212', 'Receptionist', 25000.00, CURDATE(), 'Active')
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    email = VALUES(email),
    phone = VALUES(phone);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    id_proof VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type ENUM('Single', 'Double', 'Suite', 'Deluxe') NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance', 'Reserved') DEFAULT 'Available',
    floor INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') DEFAULT 'Confirmed',
    special_requests TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (created_by) REFERENCES staff(staff_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Completed',
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Services (Junction Table)
CREATE TABLE IF NOT EXISTS booking_services (
    booking_service_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- Insert Sample Services
INSERT INTO services (service_name, description, price, status) VALUES
('Room Service', '24/7 room service', 500.00, 'Active'),
('Laundry', 'Laundry and dry cleaning', 300.00, 'Active'),
('Spa', 'Spa and massage services', 2000.00, 'Active'),
('Airport Pickup', 'Airport transfer service', 1500.00, 'Active'),
('Restaurant', 'In-house dining', 800.00, 'Active')
ON DUPLICATE KEY UPDATE service_name = service_name;

-- Insert Sample Rooms
INSERT INTO rooms (room_number, room_type, price_per_night, status, floor) VALUES
('101', 'Single', 1500.00, 'Available', 1),
('102', 'Single', 1500.00, 'Available', 1),
('201', 'Double', 2500.00, 'Available', 2),
('202', 'Double', 2500.00, 'Available', 2),
('301', 'Suite', 5000.00, 'Available', 3),
('302', 'Suite', 5000.00, 'Available', 3),
('401', 'Deluxe', 7500.00, 'Available', 4)
ON DUPLICATE KEY UPDATE room_number = room_number;

-- Update existing staff with Karnataka names
UPDATE staff SET full_name = 'Rajesh Kumar', email = 'rajesh.kumar@hotel.com', phone = '9876543210' WHERE username = 'admin';
UPDATE staff SET full_name = 'Kavya Reddy', email = 'kavya.reddy@hotel.com', phone = '9876543211' WHERE username = 'manager';
UPDATE staff SET full_name = 'Priya Shetty', email = 'priya.shetty@hotel.com', phone = '9876543212' WHERE username = 'receptionist';
UPDATE staff SET full_name = 'Arjun Rao', email = 'arjun.rao@hotel.com', phone = '9876543213' WHERE full_name = 'John Smith';
UPDATE staff SET full_name = 'Lakshmi Hegde', email = 'lakshmi.hegde@hotel.com', phone = '9876543214' WHERE full_name = 'Sarah Johnson';
UPDATE staff SET full_name = 'Suresh Naik', email = 'suresh.naik@hotel.com', phone = '9876543215' WHERE full_name = 'Michael Brown';
UPDATE staff SET full_name = 'Deepa Bhat', email = 'deepa.bhat@hotel.com', phone = '9876543216' WHERE full_name = 'Emily Davis';
UPDATE staff SET full_name = 'Ramesh Gowda', email = 'ramesh.gowda@hotel.com', phone = '9876543217' WHERE full_name = 'Robert Wilson';
UPDATE staff SET full_name = 'Anjali Kulkarni', email = 'anjali.kulkarni@hotel.com', phone = '9876543218' WHERE full_name = 'Lisa Anderson';

-- Update existing customers with Karnataka names
UPDATE customers SET full_name = 'Vikram Shetty', email = 'vikram.shetty@email.com', phone = '9845123456' WHERE customer_id = 1;
UPDATE customers SET full_name = 'Meera Nayak', email = 'meera.nayak@email.com', phone = '9845123457' WHERE customer_id = 2;
UPDATE customers SET full_name = 'Kiran Kumar', email = 'kiran.kumar@email.com', phone = '9845123458' WHERE customer_id = 3;
UPDATE customers SET full_name = 'Sowmya Rao', email = 'sowmya.rao@email.com', phone = '9845123459' WHERE customer_id = 4;
UPDATE customers SET full_name = 'Manoj Patil', email = 'manoj.patil@email.com', phone = '9845123460' WHERE customer_id = 5;
UPDATE customers SET full_name = 'Divya Hegde', email = 'divya.hegde@email.com', phone = '9845123461' WHERE customer_id = 6;
UPDATE customers SET full_name = 'Prasad Reddy', email = 'prasad.reddy@email.com', phone = '9845123462' WHERE customer_id = 7;
UPDATE customers SET full_name = 'Shruti Bhat', email = 'shruti.bhat@email.com', phone = '9845123463' WHERE customer_id = 8;
UPDATE customers SET full_name = 'Naveen Gowda', email = 'naveen.gowda@email.com', phone = '9845123464' WHERE customer_id = 9;
UPDATE customers SET full_name = 'Pooja Kulkarni', email = 'pooja.kulkarni@email.com', phone = '9845123465' WHERE customer_id = 10;

SELECT 'Database setup completed successfully!' AS message;
SELECT CONCAT('✅ Default login: username = admin, password = admin123') AS credentials;
