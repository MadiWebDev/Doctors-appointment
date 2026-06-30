# Doctor Appointment Booking System - API Documentation

## Base URL
```
Development: http://localhost:4000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

The API uses JWT access tokens and refresh tokens for authentication. Access tokens are sent via httpOnly cookies.

### Authentication Flow
1. Register/Login to receive access and refresh tokens
2. Access tokens are short-lived (3 days by default)
3. Refresh tokens are long-lived (7 days by default)
4. Use `/refresh-token` endpoint to get new access token

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP
- **Email verification**: 5 requests per hour per IP
- **General endpoints**: 100 requests per 15 minutes per IP

---

## User Endpoints

### Register User
```http
POST /api/v1/user/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123@",
  "confirmPassword": "Password123@"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": false
  }
}
```

### Login User
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123@"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": { ... },
  "accessToken": "jwt_token"
}
```

### Logout User
```http
GET /api/v1/user/logout
Cookie: accessToken=jwt_token
```

### Verify Email
```http
GET /api/v1/user/verify-email/:token
```

### Refresh Access Token
```http
GET /api/v1/user/refresh-token
Cookie: refreshToken=refresh_token
```

### Resend Verification Email
```http
POST /api/v1/user/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Forgot Password
```http
POST /api/v1/user/password/forgot
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /api/v1/user/password/reset/:token
Content-Type: application/json

{
  "password": "NewPassword123@",
  "confirmPassword": "NewPassword123@"
}
```

### Get User Details (Protected)
```http
GET /api/v1/user/details
Cookie: accessToken=jwt_token
```

### Update Password (Protected)
```http
PUT /api/v1/user/password/update
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "oldPassword": "OldPassword123@",
  "newPassword": "NewPassword123@",
  "confirmPassword": "NewPassword123@"
}
```

### Update Profile (Protected)
```http
PUT /api/v1/user/profile/update
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "username": "john_doe_updated",
  "email": "john_updated@example.com"
}
```

### Get All Users (Admin)
```http
GET /api/v1/user/admin/allUsers
Cookie: accessToken=jwt_token
```

### Get Single User (Admin)
```http
GET /api/v1/user/admin/user/:id
Cookie: accessToken=jwt_token
```

### Update User Role (Admin)
```http
PUT /api/v1/user/admin/user/:id
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "role": "doctor"
}
```

### Delete User (Admin)
```http
DELETE /api/v1/user/admin/user/:id
Cookie: accessToken=jwt_token
```

---

## Doctor Endpoints

### Get All Doctors (Public)
```http
GET /api/v1/doctor/?specialization=Cardiologist&city=NewYork&minRating=4&maxFee=100&page=1&limit=10
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `city` (optional): Filter by city
- `minRating` (optional): Minimum rating
- `maxFee` (optional): Maximum consultation fee
- `isOnline` (optional): Filter by online status (true/false)
- `coordinates` (optional): "longitude,latitude" for geolocation search
- `maxDistance` (optional): Maximum distance in km
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Get Doctor by ID (Public)
```http
GET /api/v1/doctor/:id
```

### Create Doctor Profile (Doctor)
```http
POST /api/v1/doctor/profile
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "specialization": "Cardiologist",
  "qualification": "MBBS, MD",
  "experience": 10,
  "about": "Experienced cardiologist",
  "phone": "+1234567890",
  "address": {
    "street": "123 Medical St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "location": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128]
  },
  "consultationFee": 150,
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ]
}
```

### Get My Doctor Profile (Doctor)
```http
GET /api/v1/doctor/profile/me
Cookie: accessToken=jwt_token
```

### Update Doctor Profile (Doctor)
```http
PUT /api/v1/doctor/profile/:id
Cookie: accessToken=jwt_token
Content-Type: application/json
```

### Update Availability (Doctor)
```http
PUT /api/v1/doctor/profile/:id/availability
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "availability": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ]
}
```

### Update Online Status (Doctor)
```http
PUT /api/v1/doctor/profile/:id/online-status
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "isOnline": true
}
```

### Add Payment Method (Doctor)
```http
POST /api/v1/doctor/profile/:id/payment-methods
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "bankName": "Chase Bank",
  "accountName": "John Smith",
  "accountNumber": "1234567890",
  "isDefault": true
}
```

### Update Payment Method (Doctor)
```http
PUT /api/v1/doctor/profile/:id/payment-methods/:paymentMethodId
Cookie: accessToken=jwt_token
Content-Type: application/json
```

### Delete Payment Method (Doctor)
```http
DELETE /api/v1/doctor/profile/:id/payment-methods/:paymentMethodId
Cookie: accessToken=jwt_token
```

### Add Document (Doctor)
```http
POST /api/v1/doctor/profile/:id/documents
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "documentType": "Medical License",
  "documentUrl": "https://cloudinary.com/...",
  "documentName": "Medical License.pdf"
}
```

### Add Review (Patient)
```http
POST /api/v1/doctor/:id/reviews
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent doctor",
  "verifiedVisit": true
}
```

### Get Pending Verifications (Admin)
```http
GET /api/v1/doctor/admin/pending-verifications?page=1&limit=10
Cookie: accessToken=jwt_token
```

### Verify Doctor (Admin)
```http
PUT /api/v1/doctor/admin/:id/verify
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "status": "verified",
  "reason": "Documents verified"
}
```

### Delete Doctor (Admin)
```http
DELETE /api/v1/doctor/admin/:id
Cookie: accessToken=jwt_token
```

---

## Appointment Endpoints

### Book Appointment (Patient)
```http
POST /api/v1/appointment/book
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "doctor": "doctor_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "appointmentType": "in-person",
  "reason": "Regular checkup",
  "notes": "Patient has diabetes"
}
```

### Get Appointment by ID (Protected)
```http
GET /api/v1/appointment/:id
Cookie: accessToken=jwt_token
```

### Get My Appointments (Patient)
```http
GET /api/v1/appointment/my-appointments?status=confirmed&page=1&limit=10
Cookie: accessToken=jwt_token
```

### Get Doctor Appointments (Doctor)
```http
GET /api/v1/appointment/doctor/:doctorId?status=confirmed&date=2024-01-15
Cookie: accessToken=jwt_token
```

### Get Available Slots (Public)
```http
GET /api/v1/appointment/available-slots/:doctorId?date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "day": "Monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "slots": [
    {
      "startTime": "09:00",
      "endTime": "09:30"
    },
    {
      "startTime": "09:30",
      "endTime": "10:00"
    }
  ]
}
```

### Confirm Appointment (Doctor)
```http
PUT /api/v1/appointment/:id/confirm
Cookie: accessToken=jwt_token
```

### Cancel Appointment (Patient/Doctor)
```http
PUT /api/v1/appointment/:id/cancel
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "reason": "Patient rescheduled"
}
```

### Reschedule Appointment (Patient)
```http
PUT /api/v1/appointment/:id/reschedule
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "newDate": "2024-01-16",
  "newTime": "11:00",
  "newEndTime": "11:30",
  "reason": "Work conflict"
}
```

### Complete Appointment (Doctor)
```http
PUT /api/v1/appointment/:id/complete
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "doctorNotes": "Patient is stable",
  "prescription": "Metformin 500mg",
  "diagnosis": "Type 2 Diabetes"
}
```

### Mark No-Show (Doctor)
```http
PUT /api/v1/appointment/:id/no-show
Cookie: accessToken=jwt_token
```

### Add to Waitlist (Patient)
```http
PUT /api/v1/appointment/:id/waitlist
Cookie: accessToken=jwt_token
```

### Update Video Consultation (Doctor)
```http
PUT /api/v1/appointment/:id/video-consultation
Cookie: accessToken=jwt_token
Content-Type: application/json

{
  "meetingUrl": "https://zoom.us/j/123456789",
  "meetingId": "123456789",
  "meetingPassword": "abc123",
  "platform": "zoom"
}
```

---

## Upload Endpoints

### Upload Profile Image (Doctor)
```http
POST /api/v1/upload/profile-image
Cookie: accessToken=jwt_token
Content-Type: multipart/form-data

image: [file]
```

### Upload Document (Doctor)
```http
POST /api/v1/upload/document
Cookie: accessToken=jwt_token
Content-Type: multipart/form-data

document: [file]
```

---

## Notification Endpoints

### Get Notifications (Protected)
```http
GET /api/v1/notification/?unreadOnly=false&type=appointment_booked&page=1&limit=20
Cookie: accessToken=jwt_token
```

### Get Unread Count (Protected)
```http
GET /api/v1/notification/unread-count
Cookie: accessToken=jwt_token
```

### Mark as Read (Protected)
```http
PUT /api/v1/notification/:id/read
Cookie: accessToken=jwt_token
```

### Mark All as Read (Protected)
```http
PUT /api/v1/notification/read-all
Cookie: accessToken=jwt_token
```

### Delete Notification (Protected)
```http
DELETE /api/v1/notification/:id
Cookie: accessToken=jwt_token
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error messages"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Not logged in)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., time slot already booked)
- `500` - Internal Server Error

---

## Data Models

### User Model
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "role": "user|doctor|admin|super_admin",
  "isEmailVerified": "boolean",
  "loginAttempts": "number",
  "lockUntil": "date",
  "createdAt": "date"
}
```

### Doctor Model
```json
{
  "_id": "string",
  "user": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "specialization": "string",
  "qualification": "string",
  "experience": "number",
  "about": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zipCode": "string"
  },
  "location": {
    "type": "Point",
    "coordinates": [number, number]
  },
  "consultationFee": "number",
  "availability": [
    {
      "day": "string",
      "startTime": "string",
      "endTime": "string",
      "isAvailable": "boolean"
    }
  ],
  "paymentMethods": [
    {
      "bankName": "string",
      "accountName": "string",
      "accountNumber": "string",
      "isDefault": "boolean"
    }
  ],
  "documents": [
    {
      "documentType": "string",
      "documentUrl": "string",
      "documentName": "string",
      "verified": "boolean"
    }
  ],
  "profileImage": {
    "public_id": "string",
    "url": "string"
  },
  "isVerified": "boolean",
  "verificationStatus": "pending|verified|rejected",
  "ratings": "number",
  "numOfReviews": "number",
  "isOnline": "boolean",
  "totalAppointments": "number",
  "completedAppointments": "number",
  "cancelledAppointments": "number"
}
```

### Appointment Model
```json
{
  "_id": "string",
  "patient": "ObjectId",
  "doctor": "ObjectId",
  "appointmentDate": "date",
  "appointmentTime": "string",
  "endTime": "string",
  "appointmentType": "in-person|video",
  "videoConsultation": {
    "meetingUrl": "string",
    "meetingId": "string",
    "meetingPassword": "string",
    "platform": "zoom|google-meet|other"
  },
  "status": "pending|confirmed|completed|cancelled|no-show|rescheduled",
  "reason": "string",
  "notes": "string",
  "medicalHistory": "string",
  "symptoms": ["string"],
  "paymentStatus": "pending|paid|refunded|failed",
  "remindersSent": {
    "twentyFourHour": "boolean",
    "oneHour": "boolean"
  },
  "isWaitlisted": "boolean",
  "completedAt": "date",
  "doctorNotes": "string",
  "prescription": "string",
  "diagnosis": "string"
}
```

### Notification Model
```json
{
  "_id": "string",
  "recipient": "ObjectId",
  "type": "string",
  "title": "string",
  "message": "string",
  "relatedUser": "ObjectId",
  "relatedDoctor": "ObjectId",
  "relatedAppointment": "ObjectId",
  "isRead": "boolean",
  "priority": "low|medium|high|urgent",
  "actionUrl": "string",
  "createdAt": "date"
}
```
