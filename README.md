# LeaveFlow HRMS

## Project Overview

LeaveFlow HRMS is a full-stack Leave Management System developed to simplify employee leave management and administrative approval workflows. The application provides secure authentication, leave tracking, approval management, employee administration, and analytics through a modern web interface.

---

## Features

### Employee
- Secure Login (JWT Authentication)
- Dashboard
- Apply Leave
- Leave History
- Leave Balance Tracking
- Company Leave Calendar
- Profile Management

### Admin
- Dashboard
- Approve / Reject Leave Requests
- Employee Management
- Company Leave Calendar
- Leave Analytics
- Leave Policy Overview

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hook Form
- Zod

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

---

## Project Structure

Leave-Management-System/
├── client/
├── server/

---

## Installation

### Clone Repository

git clone <repository-url>

### Frontend

cd client
npm install
npm run dev

### Backend

cd server
npm install
npm run dev

---

## Environment Variables

Backend

MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=

Frontend

VITE_API_URL=

---

## API Endpoints

Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

Leave

POST /api/leaves

GET /api/leaves/history

GET /api/leaves/balances

GET /api/leaves/admin/requests

PUT /api/leaves/requests/:id

GET /api/leaves/admin/stats

---

## Deployment

Frontend:
Vercel

Backend:
Render

Database:
MongoDB Atlas

---

## Future Improvements

- Email Notifications
- Password Reset
- Leave Policy Engine
- Attendance Integration
- Holiday Calendar