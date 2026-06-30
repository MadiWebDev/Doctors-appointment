# Doctor Appointment Booking System

A production-ready, full-stack MERN application for booking doctor appointments with three distinct user roles: Patient, Doctor, and Admin.

## Features

### Patient Role
- ✅ Register with email OTP verification
- ✅ Browse doctors filtered by specialization, fee, rating
- ✅ Select doctor → view profile + available slots by date
- ✅ Book appointment (slot locked atomically to prevent double-booking)
- ✅ View appointment history with status badges
- ✅ Cancel or reschedule appointments
- ✅ Bell icon with unread notification count

### Doctor Role
- ✅ Multi-step signup form (3 steps with progress indicator)
- ✅ Step 1 — Personal: name, email, password, phone
- ✅ Step 2 — Professional: licenseNumber (unique, required), specialization, qualifications[], experience, hospitalAffiliation, bio, consultationFee
- ✅ Step 3 — Documents: licenseDocument upload (PDF/image, max 5MB, stored on Cloudinary)
- ✅ Account status = pending until admin approves
- ✅ Doctor dashboard: today's appointments, weekly chart, earnings summary
- ✅ Availability manager: toggle working days, set start/end time + slot duration (15/30/60 min) → auto-generate Slot docs for 30 days
- ✅ Block specific dates (vacation/emergency)
- ✅ Appointment queue: accept/reject with optional message
- ✅ After appointment: add medical notes + prescription, mark complete or no-show

### Admin Role
- ✅ Dashboard stat cards: Total Patients, Total Doctors, Pending Approvals, Today's Appointments, Total Revenue, Active Users (30d)
- ✅ Doctor verification panel: List with status filter (pending/approved/rejected), View license document via Cloudinary link, Approve → email notification, Reject → modal for rejectionReason → email notification
- ✅ User management: Search/sort/paginate all patients, Activate/Deactivate (soft-disable only)
- ✅ Appointment oversight: All appointments with filters (status, doctor, patient, date range), Admin can cancel any appointment with reason, Export to CSV
- ✅ Specializations CRUD: Add/edit/delete medical specializations
- ✅ Analytics (Recharts): Line chart (appointments per day - last 30 days), Bar chart (appointments per specialization), Pie chart (appointment status breakdown), Monthly revenue trend
- ✅ System settings: maintenance mode toggle, server health status

### Technical Features
- ✅ JWT access (15min) + refresh token (7d httpOnly cookie)
- ✅ Atomic slot booking to prevent double-booking
- ✅ Edge case handling: past dates, unapproved doctors, duplicate licenseNumber, file upload > 5MB
- ✅ Role-based access control (Patient, Doctor, Admin)
- ✅ RTK Query for efficient data fetching
- ✅ Mobile-first responsive design (TailwindCSS)
- ✅ ProtectedRoute component with role-based redirect
- ✅ Loading skeletons on every data-fetching page
- ✅ Toast notifications for all user actions
- ✅ Inline Zod validation errors on all forms
- ✅ Confirmation modals before destructive actions

## Tech Stack

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication (access 15min + refresh 7d httpOnly cookie)
- **bcryptjs** - Password hashing
- **Multer + Cloudinary** - File uploads
- **Nodemailer** - Email OTP
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - CORS configuration
- **morgan** - HTTP request logger

### Frontend
- **React + Vite** - UI framework & build tool
- **React Router v6** - Client-side routing
- **Redux Toolkit + RTK Query** - State management & API calls
- **TailwindCSS** - Styling
- **React Hook Form + Zod** - Form validation
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **date-fns** - Date utilities
- **Recharts** - Analytics charts

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Cloudinary account (for file uploads)
- Gmail account (for email OTP - use App Password)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Doctor-Appointment
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory using `.env.example` as reference:

```env
# Server Configuration
PORT = '4000'
NODE_ENV = 'development'
FRONTEND_URL = 'http://localhost:5173'

# Database
MONGO_URI = 'mongodb+srv://username:password@cluster.mongodb.net/doctor-appointment'

# JWT Configuration (Access token: 15 minutes, Refresh token: 7 days)
JWT_SECRET = "your_jwt_secret_key_change_in_production_min_32_chars"
JWT_EXPIRE = "15m"
REFRESH_TOKEN_SECRET = "your_refresh_token_secret_change_in_production_min_32_chars"
REFRESH_TOKEN_EXPIRE = "7d"
COOKIE_EXPIRE = "7"

# Email Configuration (Gmail - Use App Password)
SMTP_SERVICE = "gmail"
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = "465"
SMTP_MAIL = 'your_email@gmail.com'
SMTP_PASSWORD = 'your_app_password'

# Rate Limiting
RATE_LIMIT_WINDOW_MS = '900000'
RATE_LIMIT_MAX_REQUESTS = '100'

# Account Lockout
MAX_LOGIN_ATTEMPTS = '5'
LOCKOUT_TIME_MS = '900000'

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = 'your_cloudinary_cloud_name'
CLOUDINARY_API_KEY = 'your_cloudinary_api_key'
CLOUDINARY_API_SECRET = 'your_cloudinary_api_secret'
CLOUDINARY_UPLOAD_PRESET = 'doctor_documents'

# Zoom Configuration (Optional - for video consultations)
ZOOM_API_KEY = 'your_zoom_api_key'
ZOOM_API_SECRET = 'your_zoom_api_secret'

# Redis Configuration (Optional - for caching)
REDIS_HOST = 'localhost'
REDIS_PORT = '6379'
REDIS_PASSWORD = ''
REDIS_DB = '0'

# Timezone for schedulers
TIMEZONE = 'UTC'
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory using `.env.example` as reference:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:4000`
The frontend will run on `http://localhost:5173`

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  role: Enum ['patient', 'doctor', 'admin'] (default: 'patient'),
  profileImage: { public_id, url },
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  otp: String,
  otpExpire: Date,
  refreshToken: String,
  loginAttempts: Number,
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

### Doctor Model
```javascript
{
  user: ObjectId (ref: User, required, unique),
  licenseNumber: String (required, unique),
  licenseDocument: String (required, Cloudinary URL),
  firstName: String (required),
  lastName: String (required),
  specialization: String (required, enum),
  qualifications: [String] (required),
  experience: Number (required),
  hospitalAffiliation: String (required),
  bio: String (max 500 chars),
  consultationFee: Number (required),
  availability: [{ day, startTime, endTime, isAvailable }],
  paymentMethods: [{ bankName, accountName, accountNumber, isDefault }],
  documents: [{ documentType, documentUrl, documentName, uploadedAt, verified }],
  profileImage: { public_id, url },
  status: Enum ['pending', 'approved', 'rejected'] (default: 'pending'),
  rejectionReason: String,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  ratings: Number (default: 0, min: 0, max: 5),
  numOfReviews: Number (default: 0),
  reviews: [{ user, rating, comment, verifiedVisit, createdAt }],
  isOnline: Boolean (default: false),
  lastOnline: Date,
  totalAppointments: Number (default: 0),
  completedAppointments: Number (default: 0),
  cancelledAppointments: Number (default: 0)
}
```

### Slot Model
```javascript
{
  doctor: ObjectId (ref: Doctor, required),
  date: Date (required),
  startTime: String (required),
  endTime: String (required),
  duration: Number (enum: [15, 30, 60], default: 30),
  isBooked: Boolean (default: false),
  bookedBy: ObjectId (ref: User),
  bookedAt: Date,
  isBlocked: Boolean (default: false),
  blockReason: String,
  blockedAt: Date,
  appointment: ObjectId (ref: Appointment)
}
```

### Appointment Model
```javascript
{
  patient: ObjectId (ref: User, required),
  doctor: ObjectId (ref: Doctor, required),
  slotId: ObjectId (ref: Slot),
  appointmentDate: Date (required),
  appointmentTime: String (required),
  endTime: String (required),
  appointmentType: Enum ['in-person', 'video'] (default: 'in-person'),
  videoConsultation: { meetingUrl, meetingId, meetingPassword, platform },
  status: Enum ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'] (default: 'pending'),
  reason: String (required),
  notes: String,
  medicalHistory: String,
  symptoms: [String],
  cancellationDetails: { cancelledBy, cancelledAt, cancellationReason },
  reschedulingDetails: { rescheduledBy, rescheduledAt, reschedulingReason, previousDate, previousTime },
  paymentStatus: Enum ['pending', 'paid', 'refunded', 'failed'] (default: 'pending'),
  paymentMethod: String,
  paymentAmount: Number,
  paidAt: Date,
  completedAt: Date,
  doctorNotes: String,
  prescription: String,
  diagnosis: String,
  noShowAt: Date
}
```

### Specialization Model
```javascript
{
  name: String (required, unique),
  description: String,
  icon: String,
  isActive: Boolean (default: true),
  displayOrder: Number (default: 0),
  totalDoctors: Number (default: 0),
  createdBy: ObjectId (ref: User)
}
```

### Notification Model
```javascript
{
  recipient: ObjectId (ref: User, required),
  type: Enum ['appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'appointment_rescheduled', 'appointment_reminder', 'appointment_completed', 'payment_received', 'doctor_verified', 'doctor_rejected', 'new_review', 'message_received', 'system'],
  title: String (required),
  message: String (required),
  relatedUser: ObjectId (ref: User),
  relatedDoctor: ObjectId (ref: Doctor),
  relatedAppointment: ObjectId (ref: Appointment),
  isRead: Boolean (default: false),
  readAt: Date,
  priority: Enum ['low', 'medium', 'high', 'urgent'] (default: 'medium'),
  actionUrl: String,
  emailSent: Boolean (default: false),
  emailSentAt: Date
}
```

## API Documentation

### Base URL
- Development: `http://localhost:4000/api/v1`
- Production: `https://your-domain.com/api/v1`

### Authentication Endpoints
- `POST /user/register` - Register new user
- `POST /user/login` - Login user
- `GET /user/logout` - Logout user
- `GET /user/refresh-token` - Refresh access token
- `GET /user/verify-email/:token` - Verify email
- `POST /user/send-otp` - Send OTP for email verification
- `POST /user/verify-otp` - Verify OTP

### Doctor Endpoints
- `GET /doctor` - Get all doctors with filters
- `GET /doctor/:id` - Get doctor by ID
- `POST /doctor/profile` - Create doctor profile
- `PUT /doctor/profile/:id` - Update doctor profile
- `PUT /doctor/:id/verify` - Verify/reject doctor (Admin)
- `GET /doctor/pending-verifications` - Get pending verifications (Admin)

### Appointment Endpoints
- `POST /appointment/book` - Book appointment
- `GET /appointment/my-appointments` - Get my appointments
- `GET /appointment/:id` - Get appointment by ID
- `PUT /appointment/:id/confirm` - Confirm appointment
- `PUT /appointment/:id/cancel` - Cancel appointment
- `PUT /appointment/:id/reschedule` - Reschedule appointment
- `PUT /appointment/:id/complete` - Complete appointment

### Slot Endpoints
- `GET /slot/doctor/:doctorId/available?date=YYYY-MM-DD` - Get available slots
- `POST /slot/generate` - Generate slots for doctor (Doctor)
- `GET /slot/doctor/:doctorId` - Get doctor's slots (Doctor)
- `PUT /slot/:slotId/block` - Block a slot (Doctor)
- `PUT /slot/:slotId/unblock` - Unblock a slot (Doctor)

### Specialization Endpoints
- `GET /specialization` - Get all specializations
- `GET /specialization/active` - Get active specializations
- `POST /specialization` - Create specialization (Admin)
- `PUT /specialization/:id` - Update specialization (Admin)
- `DELETE /specialization/:id` - Delete specialization (Admin)
- `GET /specialization/stats` - Get specialization statistics (Admin)

### Admin Analytics Endpoints
- `GET /admin/analytics/stats` - Get dashboard statistics
- `GET /admin/analytics/appointments-daily` - Appointments per day (last 30 days)
- `GET /admin/analytics/appointments-specialization` - Appointments by specialization
- `GET /admin/analytics/appointments-status` - Appointment status breakdown
- `GET /admin/analytics/revenue-monthly` - Monthly revenue trend
- `GET /admin/analytics/doctor-performance` - Doctor performance metrics

### Notification Endpoints
- `GET /notification` - Get notifications
- `PUT /notification/:id/read` - Mark as read
- `GET /notification/unread-count` - Get unread count

### Upload Endpoints
- `POST /upload/profile-image` - Upload profile image
- `POST /upload/document` - Upload document

## Deployment

### Backend Deployment (Render/Heroku/Vercel)

1. Set environment variables in your hosting platform
2. Push code to GitHub
3. Connect repository to hosting platform
4. Deploy

**Required Environment Variables:**
- MONGO_URI
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- SMTP_MAIL
- SMTP_PASSWORD
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FRONTEND_URL

### Frontend Deployment (Vercel)

1. Build frontend: `npm run build`
2. Deploy to Vercel
3. Update `FRONTEND_URL` in backend .env to production URL

**Required Environment Variables:**
- VITE_API_URL (production backend URL)
- VITE_CLOUDINARY_CLOUD_NAME

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong secrets** - Generate secure JWT secrets (min 32 characters)
3. **Enable HTTPS** - Use SSL certificates in production
4. **Rate limiting** - Already implemented on auth endpoints
5. **Input validation** - Zod validation on all routes
6. **SQL injection prevention** - Mongoose sanitization
7. **XSS protection** - XSS-clean middleware
8. **CORS** - Whitelist your frontend domain
9. **Use httpOnly cookies** - For refresh tokens
10. **Implement account lockout** - After failed login attempts

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Check MONGO_URI in .env
- Ensure MongoDB is running
- Check network connectivity

**Email Not Sending:**
- Verify SMTP_HOST is correct (smtp.gmail.com)
- Use App Password for Gmail (not regular password)
- Check firewall settings

**Image Upload Failing:**
- Verify Cloudinary credentials
- Check file size limits (max 5MB)
- Ensure file type is allowed (PDF, JPG, PNG)

**CORS Errors:**
- Update FRONTEND_URL in backend .env
- Check CORS configuration in app.js

**Slot Booking Failing:**
- Check if doctor is approved
- Verify slot is not already booked
- Ensure appointment date is not in the past

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@doctor-appointment.com or open an issue in the repository.
