# HOTEL MANAGEMENT SYSTEM

## DATABASE MANAGEMENT SYSTEM PROJECT REPORT
**Course Code:** UE23CS351A

---

## TEAM DETAILS

**Project Title:** Hotel Management System with Advanced Database Features

**Team Members:**
- Student Name: [Your Name]
- USN: [Your USN]
- Section: [Your Section]

**Institution:** [Your College Name]  
**Department:** Computer Science and Engineering  
**Academic Year:** 2024-2025  
**Semester:** III

**Submitted to:**  
**Faculty Name:** [Professor's Name]  
**Department of Computer Science and Engineering**

**Date of Submission:** November 4, 2025

---

# TABLE OF CONTENTS

1. [Abstract](#abstract)
2. [User Requirement Specification](#user-requirement-specification)
3. [Software & Tools Used](#software-tools-used)
4. [ER Diagram](#er-diagram)
5. [Relational Schema](#relational-schema)
6. [DDL Commands](#ddl-commands)
7. [CRUD Operations](#crud-operations)
8. [Features & Functionalities](#features-functionalities)
9. [Advanced SQL Queries](#advanced-sql-queries)
10. [Triggers Implementation](#triggers-implementation)
11. [Stored Procedures](#stored-procedures)
12. [Code Snippets](#code-snippets)
13. [SQL Files](#sql-files)
14. [GitHub Repository](#github-repository)
15. [Conclusion](#conclusion)

---

<a name="abstract"></a>
# 1. ABSTRACT

The **Hotel Management System** is a comprehensive database-driven web application designed to automate and streamline all hotel operations. This system provides a centralized platform for managing staff, customers, rooms, bookings, payments, and services efficiently.

## Problem Statement

Traditional hotel management relies on manual processes and disconnected systems, leading to inefficiencies, errors, and poor customer experience. There is a need for an integrated system that:
- Automates booking and payment processes
- Manages room inventory in real-time
- Tracks customer information and history
- Provides role-based access for different staff levels
- Generates analytics and reports for business insights

## Solution Overview

This project implements a full-stack web application with:
- **Backend:** Node.js + Express.js REST API
- **Frontend:** React 18 with modern UI/UX
- **Database:** MySQL with normalized schema (3NF)
- **Security:** Role-based authentication and authorization
- **Automation:** 5 database triggers for automatic operations
- **Analytics:** 6 stored procedures for complex data processing

## Key Features

1. **Complete CRUD Operations** for all entities through intuitive GUI
2. **Role-Based Access Control** - Super Admin, Admin, Manager, Receptionist
3. **Real-time Room Availability** using stored procedures
4. **Automatic Audit Logging** via database triggers
5. **Advanced Analytics Dashboard** with revenue tracking
6. **Payment Management** with loyalty points system
7. **Search & Filter** functionality across all modules
8. **Indian Localization** - ₹ currency, Karnataka names

## Project Scope

The system manages:
- **Staff Management:** 9 staff members with 4 different roles
- **Customer Management:** 20+ customers with complete profiles
- **Room Inventory:** 10 rooms across 5 categories
- **Bookings:** Real-time availability checking and status tracking
- **Payments:** Complete transaction history with payment methods
- **Services:** 16 hotel services with booking integration
- **Analytics:** Revenue, occupancy, and customer insights

---

<a name="user-requirement-specification"></a>
# 2. USER REQUIREMENT SPECIFICATION

## 2.1 Functional Requirements

### FR1: User Authentication & Authorization
- **FR1.1:** System shall support multiple user roles (Super Admin, Admin, Manager, Receptionist)
- **FR1.2:** Users must login with username and password
- **FR1.3:** Each role shall have specific access permissions
- **FR1.4:** System shall track logged-in user for audit purposes

### FR2: Staff Management
- **FR2.1:** Admin can create new staff members with role assignment
- **FR2.2:** System shall store staff details (name, username, email, phone, salary, role)
- **FR2.3:** Admin can update staff information including salary changes
- **FR2.4:** System shall automatically log all salary and role changes (via trigger)
- **FR2.5:** Admin can view complete audit trail of staff changes

### FR3: Customer Management
- **FR3.1:** Staff can register new customers with personal details
- **FR3.2:** System shall store customer information (name, email, phone, ID proof)
- **FR3.3:** System shall track loyalty points for each customer
- **FR3.4:** Staff can update customer information
- **FR3.5:** Staff can search customers by name, email, or phone
- **FR3.6:** System shall display customer booking history

### FR4: Room Management
- **FR4.1:** Admin can add new rooms with specifications
- **FR4.2:** System shall categorize rooms (Single, Double, Deluxe, Suite, Presidential)
- **FR4.3:** System shall track room status (Available, Occupied, Maintenance, Cleaning)
- **FR4.4:** System shall automatically update room status when bookings are created/completed
- **FR4.5:** Staff can view all rooms with current status
- **FR4.6:** System shall store room amenities and descriptions

### FR5: Booking Management
- **FR5.1:** Staff can create bookings for customers
- **FR5.2:** System shall check room availability for specified dates (using stored procedure)
- **FR5.3:** System shall calculate total nights and amount automatically
- **FR5.4:** System shall support booking statuses (Pending, Confirmed, Checked-in, Checked-out, Cancelled)
- **FR5.5:** Staff can update booking status
- **FR5.6:** System shall prevent double-booking of rooms
- **FR5.7:** System shall update room status automatically based on booking status (via trigger)

### FR6: Payment Management
- **FR6.1:** Staff can record payments for bookings
- **FR6.2:** System shall support multiple payment methods (Cash, Credit Card, Debit Card, UPI)
- **FR6.3:** System shall calculate loyalty points based on payment amount (via trigger)
- **FR6.4:** System shall track payment status (Pending, Completed, Failed, Refunded)
- **FR6.5:** Staff can view payment history

### FR7: Service Management
- **FR7.1:** System shall maintain catalog of hotel services
- **FR7.2:** Services shall be categorized (Room Service, Laundry, Spa, Dining, etc.)
- **FR7.3:** Staff can add services to bookings
- **FR7.4:** System shall update booking total when services are added (via trigger)

### FR8: Analytics & Reporting
- **FR8.1:** System shall display total customers, rooms, bookings, revenue
- **FR8.2:** System shall calculate occupancy rate for date ranges (using stored procedure)
- **FR8.3:** System shall rank top customers by revenue (using stored procedure)
- **FR8.4:** System shall show revenue breakdown by room type
- **FR8.5:** System shall identify most popular services

## 2.2 Non-Functional Requirements

### NFR1: Performance
- System shall respond to user actions within 2 seconds
- Database queries shall be optimized using indexes
- Stored procedures shall be used for complex calculations

### NFR2: Security
- Passwords shall be stored securely
- SQL injection attacks shall be prevented using parameterized queries
- Session management shall timeout after inactivity

### NFR3: Usability
- Interface shall be intuitive and user-friendly
- All forms shall have validation
- Error messages shall be clear and helpful
- Search functionality shall be available on all list pages

### NFR4: Reliability
- Database shall maintain referential integrity
- Transactions shall be ACID compliant
- System shall handle concurrent bookings correctly

### NFR5: Maintainability
- Code shall follow modular architecture
- Database schema shall be normalized to 3NF
- Documentation shall be comprehensive

## 2.3 System Architecture

```
┌─────────────────────────────────────────────────┐
│             React Frontend (Port 3001)          │
│  - Login Page                                   │
│  - Dashboard                                    │
│  - Staff Management                             │
│  - Customer Management                          │
│  - Room Management                              │
│  - Booking Management                           │
│  - Payment Management                           │
│  - Services Management                          │
│  - Analytics Dashboard                          │
└────────────────┬────────────────────────────────┘
                 │ HTTP REST API
┌────────────────▼────────────────────────────────┐
│        Node.js + Express Backend                │
│  - Authentication Routes                        │
│  - CRUD API Endpoints                           │
│  - Business Logic Layer                         │
│  - Stored Procedure Invocation                  │
└────────────────┬────────────────────────────────┘
                 │ MySQL2 Driver
┌────────────────▼────────────────────────────────┐
│            MySQL Database                       │
│  - 8 Normalized Tables (3NF)                    │
│  - 5 Database Triggers                          │
│  - 6 Stored Procedures                          │
│  - Foreign Key Constraints                      │
│  - Indexes for Performance                      │
└─────────────────────────────────────────────────┘
```

## 2.4 Use Case Diagram

**Actors:**
1. Super Admin - Full system access
2. Admin - Cannot delete staff
3. Manager - Cannot manage staff
4. Receptionist - Customer/booking operations only

**Key Use Cases:**
- Login to System
- Manage Staff (Create, Update, Delete)
- Manage Customers
- Manage Rooms
- Create Booking
- Process Payment
- View Analytics
- Generate Reports

---

<a name="software-tools-used"></a>
# 3. SOFTWARE & TOOLS USED

## 3.1 Development Tools

| Category | Tool/Software | Version | Purpose |
|----------|---------------|---------|---------|
| **IDE** | Visual Studio Code | 1.84.2 | Primary development environment |
| **Database** | MySQL Community Server | 8.0.35 | Database management system |
| **Database GUI** | MySQL Workbench | 8.0.35 | Database design and administration |
| **Version Control** | Git | 2.42.0 | Source code management |
| **Package Manager** | npm | 10.2.3 | Node package management |
| **API Testing** | Postman | 10.18 | REST API testing |
| **Browser** | Google Chrome | 119.0 | Web application testing |

## 3.2 Programming Languages

| Language | Version | Usage |
|----------|---------|-------|
| **JavaScript (ES6+)** | ECMAScript 2021 | Frontend & Backend logic |
| **SQL** | MySQL 8.0 | Database queries, triggers, procedures |
| **HTML5** | - | Frontend markup |
| **CSS3** | - | Styling with Tailwind CSS |
| **JSX** | React 18 | React component syntax |

## 3.3 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI component library |
| **React Router** | 6.18.0 | Client-side routing |
| **Vite** | 4.5.0 | Build tool and dev server |
| **Tailwind CSS** | 3.3.5 | Utility-first CSS framework |
| **Lucide React** | 0.292.0 | Icon library |
| **Axios** | 1.6.1 | HTTP client for API calls |

## 3.4 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.9.0 | JavaScript runtime |
| **Express.js** | 4.18.2 | Web application framework |
| **MySQL2** | 3.6.3 | MySQL database driver |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.3.1 | Environment variable management |

## 3.5 Database Features

| Feature | Description |
|---------|-------------|
| **Storage Engine** | InnoDB |
| **Character Set** | utf8mb4 |
| **Collation** | utf8mb4_unicode_ci |
| **Normalization** | Third Normal Form (3NF) |
| **Constraints** | Primary Keys, Foreign Keys, NOT NULL, UNIQUE |
| **Triggers** | 5 AFTER INSERT/UPDATE triggers |
| **Stored Procedures** | 6 custom procedures for business logic |
| **Indexes** | Primary key indexes, Foreign key indexes |

## 3.6 Development Environment

```
Operating System: Windows 11
RAM: 16 GB
Processor: Intel Core i5/i7
Node.js: v20.17.0
npm: v10.8.2
MySQL: v8.0.35
```

## 3.7 Project Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "axios": "^1.6.1",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.5",
    "vite": "^4.5.0"
  }
}
```

---

<a name="er-diagram"></a>
# 4. ER DIAGRAM

## 4.1 Entity-Relationship Diagram

```
┌─────────────┐
│   STAFF     │
│─────────────│
│ staff_id PK │
│ full_name   │
│ username    │
│ password    │
│ email       │
│ phone       │
│ role        │
│ salary      │
│ status      │
└─────────────┘

┌──────────────────┐
│   CUSTOMERS      │
│──────────────────│
│ customer_id PK   │
│ first_name       │
│ last_name        │
│ email            │
│ phone            │
│ id_proof_type    │
│ id_proof_number  │
│ loyalty_points   │
└──────────────────┘
        │
        │ 1
        │
        │ Makes
        │
        │ M
        ▼
┌──────────────────┐         ┌─────────────┐
│    BOOKINGS      │    M    │    ROOMS    │
│──────────────────│◄────────┤─────────────│
│ booking_id PK    │  Books  │ room_id PK  │
│ customer_id FK   │    1    │ room_number │
│ room_id FK       │         │ room_type   │
│ check_in         │         │ price/night │
│ check_out        │         │ status      │
│ num_guests       │         │ floor_number│
│ total_nights     │         │ amenities   │
│ total_amount     │         └─────────────┘
│ status           │
│ special_requests │
└──────────────────┘
        │
        │ 1
        │
        │ Has
        │
        │ 1
        ▼
┌──────────────────┐
│    PAYMENTS      │
│──────────────────│
│ payment_id PK    │
│ booking_id FK    │
│ amount           │
│ payment_date     │
│ payment_method   │
│ payment_status   │
│ transaction_id   │
└──────────────────┘

┌──────────────────┐         ┌─────────────────────┐         ┌─────────────┐
│    BOOKINGS      │    M    │  BOOKING_SERVICES   │    M    │  SERVICES   │
│──────────────────│◄────────┤─────────────────────│────────►│─────────────│
│ booking_id PK    │         │ booking_service_id  │         │ service_id  │
└──────────────────┘         │ booking_id FK       │         │ name        │
                             │ service_id FK       │         │ description │
                             │ quantity            │         │ price       │
                             │ service_date        │         │ category    │
                             └─────────────────────┘         └─────────────┘

┌────────────────────┐
│ STAFF_AUDIT_LOG    │
│────────────────────│
│ audit_id PK        │
│ staff_id FK        │
│ old_salary         │
│ new_salary         │
│ old_role           │
│ new_role           │
│ changed_at         │
└────────────────────┘
```

## 4.2 Entity Descriptions

### 4.2.1 STAFF
**Description:** Stores information about hotel employees
- **Primary Key:** staff_id (AUTO_INCREMENT)
- **Attributes:**
  - full_name: Employee's full name
  - username: Login username (UNIQUE)
  - password: Login password
  - email: Email address (UNIQUE)
  - phone: Contact number
  - role: ENUM(Super Admin, Admin, Manager, Receptionist, Housekeeping, Maintenance)
  - salary: Monthly salary (DECIMAL)
  - status: ENUM(Active, Inactive)

### 4.2.2 CUSTOMERS
**Description:** Stores guest/customer information
- **Primary Key:** customer_id (AUTO_INCREMENT)
- **Attributes:**
  - first_name, last_name: Customer name
  - email: Email address (UNIQUE)
  - phone: Contact number
  - id_proof_type: ENUM(Aadhar, Passport, Driving License, PAN Card)
  - id_proof_number: ID proof number
  - loyalty_points: Accumulated points (updated by trigger)

### 4.2.3 ROOMS
**Description:** Hotel room inventory
- **Primary Key:** room_id (AUTO_INCREMENT)
- **Attributes:**
  - room_number: Room identifier (UNIQUE)
  - room_type: ENUM(Single, Double, Deluxe, Suite, Presidential)
  - price_per_night: Room rate (DECIMAL)
  - max_occupancy: Maximum guests allowed
  - floor_number: Floor location
  - status: ENUM(Available, Occupied, Maintenance, Cleaning)
  - amenities: JSON/TEXT describing features

### 4.2.4 BOOKINGS
**Description:** Room reservations
- **Primary Key:** booking_id (AUTO_INCREMENT)
- **Foreign Keys:**
  - customer_id → CUSTOMERS(customer_id)
  - room_id → ROOMS(room_id)
- **Attributes:**
  - check_in, check_out: Booking dates
  - number_of_guests: Guest count
  - total_nights: Calculated duration
  - total_amount: Total charge (DECIMAL)
  - status: ENUM(Pending, Confirmed, Checked-in, Checked-out, Cancelled)
  - special_requests: TEXT

### 4.2.5 PAYMENTS
**Description:** Payment transactions
- **Primary Key:** payment_id (AUTO_INCREMENT)
- **Foreign Key:** booking_id → BOOKINGS(booking_id)
- **Attributes:**
  - amount: Payment amount (DECIMAL)
  - payment_date: Transaction date
  - payment_method: ENUM(Cash, Credit Card, Debit Card, UPI)
  - payment_status: ENUM(Pending, Completed, Failed, Refunded)
  - transaction_id: External transaction reference

### 4.2.6 SERVICES
**Description:** Hotel services catalog
- **Primary Key:** service_id (AUTO_INCREMENT)
- **Attributes:**
  - service_name: Name of service
  - description: Service details
  - price: Service charge (DECIMAL)
  - category: ENUM(Room Service, Laundry, Spa, Dining, Transport, etc.)

### 4.2.7 BOOKING_SERVICES
**Description:** Many-to-many relationship between bookings and services
- **Primary Key:** booking_service_id (AUTO_INCREMENT)
- **Foreign Keys:**
  - booking_id → BOOKINGS(booking_id)
  - service_id → SERVICES(service_id)
- **Attributes:**
  - quantity: Number of service units
  - service_date: Date service was provided

### 4.2.8 STAFF_AUDIT_LOG
**Description:** Audit trail for staff changes (populated by trigger)
- **Primary Key:** audit_id (AUTO_INCREMENT)
- **Foreign Key:** staff_id → STAFF(staff_id)
- **Attributes:**
  - old_salary, new_salary: Salary before/after
  - old_role, new_role: Role before/after
  - changed_at: Timestamp of change

## 4.3 Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Customer - Booking | 1:M | One customer can have multiple bookings |
| Room - Booking | 1:M | One room can have multiple bookings (at different times) |
| Booking - Payment | 1:1 | One booking has one payment |
| Booking - Service | M:N | Bookings can have multiple services (via BOOKING_SERVICES) |
| Staff - Audit Log | 1:M | One staff member can have multiple audit entries |

---

<a name="relational-schema"></a>
# 5. RELATIONAL SCHEMA

## 5.1 Database Schema (Third Normal Form - 3NF)

### Table: staff
```sql
staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role ENUM('Super Admin', 'Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Maintenance') NOT NULL,
    salary DECIMAL(10,2),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Table: customers
```sql
customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    id_proof_type ENUM('Aadhar', 'Passport', 'Driving License', 'PAN Card') NOT NULL,
    id_proof_number VARCHAR(50) NOT NULL,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Table: rooms
```sql
rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type ENUM('Single', 'Double', 'Deluxe', 'Suite', 'Presidential') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_occupancy INT NOT NULL,
    size VARCHAR(20),
    description TEXT,
    amenities TEXT,
    status ENUM('Available', 'Occupied', 'Maintenance', 'Cleaning') DEFAULT 'Available',
    floor_number INT,
    staff_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
)
```

### Table: bookings
```sql
bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_guests INT NOT NULL,
    total_nights INT,
    total_amount DECIMAL(10,2),
    status ENUM('Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled') DEFAULT 'Pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
)
```

### Table: payments
```sql
payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
)
```

### Table: services
```sql
services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('Room Service', 'Laundry', 'Spa', 'Dining', 'Transport', 'Conference', 'Other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Table: booking_services
```sql
booking_services (
    booking_service_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    service_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
)
```

### Table: staff_audit_log
```sql
staff_audit_log (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    old_role VARCHAR(50),
    new_role VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
)
```

## 5.2 Normalization Analysis

### First Normal Form (1NF)
✅ All attributes contain atomic values  
✅ No repeating groups  
✅ Each table has a primary key  

### Second Normal Form (2NF)
✅ All non-key attributes depend on the entire primary key  
✅ No partial dependencies  
✅ Composite keys properly designed (booking_services)  

### Third Normal Form (3NF)
✅ No transitive dependencies  
✅ Customer name not stored in bookings (only customer_id)  
✅ Room details not duplicated in bookings (only room_id)  
✅ Service details not duplicated in booking_services  
✅ Derived attributes (total_nights, total_amount) calculated via triggers  

