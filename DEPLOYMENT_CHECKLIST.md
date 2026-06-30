# Pre-Deployment Checklist

## Before You Start

- [ ] Create accounts on required platforms:
  - [ ] MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
  - [ ] Redis Cloud (https://redis.com/try-free/)
  - [ ] Cloudinary (https://cloudinary.com/)
  - [ ] Render (https://render.com/) or Railway (https://railway.app/)
  - [ ] Vercel (https://vercel.com/)

## Database Setup

- [ ] MongoDB Atlas:
  - [ ] Create free cluster
  - [ ] Create database user
  - [ ] Whitelist IP addresses (0.0.0.0/0)
  - [ ] Get connection string
  - [ ] Test connection locally

- [ ] Redis Cloud:
  - [ ] Create free database
  - [ ] Get connection details (host, port, password)
  - [ ] Test connection locally

## External Services Setup

- [ ] Cloudinary:
  - [ ] Create account
  - [ ] Get Cloud Name, API Key, API Secret
  - [ ] Test upload locally

- [ ] Email Service (Gmail):
  - [ ] Enable 2FA on Gmail
  - [ ] Generate App Password
  - [ ] Test email sending locally

- [ ] Zoom (Optional):
  - [ ] Create Server-to-Server OAuth app
  - [ ] Get API Key and Secret
  - [ ] Test video integration

## Backend Preparation

- [ ] Update `backend/.env` with production values:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET (use strong random string)
  - [ ] REFRESH_TOKEN_SECRET (use strong random string)
  - [ ] EMAIL_USER and EMAIL_PASS
  - [ ] CLOUDINARY credentials
  - [ ] REDIS credentials
  - [ ] ZOOM credentials (if using)
  - [ ] FRONTEND_URL (will update after frontend deployment)

- [ ] Test backend locally with production env:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- [ ] Verify all endpoints work
- [ ] Check database connections
- [ ] Test file uploads
- [ ] Test email sending

## Frontend Preparation

- [ ] Update `frontend/.env.production`:
  - [ ] VITE_API_URL (will update after backend deployment)
  - [ ] VITE_SOCKET_URL (will update after backend deployment)

- [ ] Test frontend build locally:
  ```bash
  cd frontend
  npm install
  npm run build
  npm run preview
  ```
- [ ] Verify build completes without errors
- [ ] Test preview build

## Deployment Order

### 1. Deploy Backend First
- [ ] Push code to GitHub
- [ ] Connect repository to Render/Railway
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Note the backend URL
- [ ] Test `/health` endpoint
- [ ] Test API endpoints

### 2. Update Frontend Config
- [ ] Update `frontend/.env.production` with backend URL
- [ ] Push changes to GitHub

### 3. Deploy Frontend
- [ ] Connect repository to Vercel
- [ ] Configure environment variables
- [ ] Deploy frontend
- [ ] Note the frontend URL

### 4. Update Backend CORS
- [ ] Update backend `FRONTEND_URL` environment variable
- [ ] Redeploy backend

## Post-Deployment Testing

- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Doctor profile creation works
- [ ] Appointment booking works
- [ ] File uploads work
- [ ] Email notifications work
- [ ] Real-time features work (Socket.io)
- [ ] Mobile responsive design works
- [ ] PWA installation works

## Security Verification

- [ ] HTTPS is enabled on both frontend and backend
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed
- [ ] Rate limiting is working
- [ ] Input validation is working
- [ ] Authentication is secure
- [ ] Database access is restricted

## Performance Check

- [ ] Page load time is acceptable
- [ ] API response time is acceptable
- [ ] Images are optimized
- [ ] Static assets are cached
- [ ] Database queries are optimized

## Monitoring Setup

- [ ] Set up error monitoring (optional: Sentry)
- [ ] Set up uptime monitoring (optional: UptimeRobot)
- [ ] Configure log viewing on platforms
- [ ] Set up analytics (optional: Google Analytics)

## Backup Strategy

- [ ] Enable MongoDB Atlas backups (if on paid tier)
- [ ] Document backup procedures
- [ ] Test restore process

## Documentation

- [ ] Update README with deployment URLs
- [ ] Document environment variables
- [ ] Create user guide (if needed)
- [ ] Document API endpoints

## Final Steps

- [ ] Share deployment URLs with stakeholders
- [ ] Monitor initial traffic
- [ ] Check for any runtime errors
- [ ] Gather user feedback
- [ ] Plan for scaling if needed
