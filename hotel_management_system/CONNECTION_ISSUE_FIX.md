# Hotel Management System - Connection Issue & Solution

## Problem Summary
Windows Firewall is blocking Node.js from accepting incoming connections on most ports. Only port 3001 (backend) is working.

## Current Status
✅ Backend API: Running on port 3001 - **WORKS**  
❌ Frontend: Cannot bind to any port (3000, 4173, 8080) - **BLOCKED**

## Solution: Allow Node.js Through Windows Firewall

### Quick Fix (Run PowerShell as Administrator):

```powershell
# Allow Node.js through Windows Firewall
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow

# OR add firewall rule for specific port
New-NetFirewallRule -DisplayName "Node Port 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### Manual Fix (GUI):

1. **Open Windows Defender Firewall**
   - Press Windows key
   - Type "Windows Defender Firewall"
   - Click "Allow an app through Windows Firewall"

2. **Add Node.js**
   - Click "Change settings"
   - Click "Allow another app..."
   - Click "Browse..."
   - Navigate to: `C:\Program Files\nodejs\node.exe`
   - Click "Add"
   - Make sure both "Private" and "Public" are checked
   - Click "OK"

3. **Restart the servers**

## Alternative: Use Backend to Serve Frontend

Since port 3001 works, we can configure the backend to also serve the frontend files:

### Steps:

1. Copy the built frontend files to backend:
```powershell
xcopy "C:\Users\Shruthana\Downloads\hotel_management_system (2)\hotel_management_system\hotel-management-frontend\dist\*" "C:\Users\Shruthana\Downloads\hotel_management_system (2)\hotel_management_system\hotel-management-backend\public\" /E /I /Y
```

2. Edit `server.js` in backend to serve static files (already configured)

3. Access the app at: **http://localhost:3001**

## Database Setup

Run this SQL script in MySQL Workbench or command line:
**Location:** `hotel-management-backend\database\setup.sql`

### Login Credentials:
```
Username: admin
Password: admin123
```

## How to Start the Application

### Option 1: After Firewall Fix
```powershell
# Terminal 1 - Backend
cd "C:\Users\Shruthana\Downloads\hotel_management_system (2)\hotel_management_system\hotel-management-backend"
npm start

# Terminal 2 - Frontend
cd "C:\Users\Shruthana\Downloads\hotel_management_system (2)\hotel_management_system\hotel-management-frontend"
node serve.js

# Access: http://localhost:8080
```

### Option 2: Using Backend Port Only (Current Workaround)
```powershell
# Only start backend
cd "C:\Users\Shruthana\Downloads\hotel_management_system (2)\hotel_management_system\hotel-management-backend"
npm start

# Access: http://localhost:3001
```

## Next Steps

1. **Fix the firewall** using one of the methods above
2. **Set up the database** using setup.sql
3. **Start both servers**
4. **Login** with admin/admin123
5. **Enjoy your hotel management system!**

## Why This Happened

- Vite dev server doesn't actually bind to ports on Windows when firewall blocks it
- It reports "ready" but netstat shows no listening port
- Backend works because it was allowed through firewall earlier
- This is a Windows security feature, not a code issue

## Contact/Help

If you continue having issues:
1. Check Windows Firewall logs
2. Try disabling firewall temporarily to confirm
3. Use backend-only option as temporary workaround
