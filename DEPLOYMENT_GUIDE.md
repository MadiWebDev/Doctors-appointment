# Doctor Appointment System - Deployment Guide

## Recommended Deployment Stack

### Best Option (Free Tier Available)
- **Frontend**: Vercel (Free tier, excellent for React/Vite apps)
- **Backend**: Render (Free tier available, supports Node.js)
- **Database**: MongoDB Atlas (Free tier available)
- **Redis**: Redis Cloud (Free tier available)
- **File Storage**: Cloudinary (Free tier available)

### Alternative Options
- **Heroku**: Both frontend and backend (paid after free tier)
- **Railway**: All-in-one platform (free tier available)
- **DigitalOcean**: Full control, paid but affordable

---

## Prerequisites

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. Create a database user
5. Whitelist IP addresses (0.0.0.0/0 for all IPs)
6. Get your connection string

### 2. Redis Cloud Setup
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Get connection details (host, port, password)

### 3. Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from Dashboard

### 4. Zoom Setup (if using video consultations)
1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Create a Server-to-Server OAuth app
3. Get API Key and Secret

### 5. Email Setup (Gmail)
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Use this as EMAIL_PASS

---

## Backend Deployment (Render)

### Step 1: Prepare Backend
```bash
cd backend
```

### Step 2: Update .env for Production
Create `.env` file with production values:
```env
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/doctor-appointment?retryWrites=true&w=majority

JWT_SECRET=your_strong_jwt_secret_min_32_chars
JWT_EXPIRE=3d
REFRESH_TOKEN_SECRET=your_strong_refresh_secret_min_32_chars
REFRESH_TOKEN_EXPIRE=7d
COOKIE_EXPIRE=5

SMPT_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MS=900000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ZOOM_API_KEY=your_zoom_key
ZOOM_API_SECRET=your_zoom_secret

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

TIMEZONE=UTC
```

### Step 3: Deploy to Render
1. Go to [Render](https://render.com/)
2. Create a free account
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: doctor-appointment-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables**: Add all from .env file
6. Click "Deploy Web Service"

### Step 4: Get Backend URL
After deployment, Render will provide a URL like:
`https://doctor-appointment-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd frontend
```

### Step 2: Update .env for Production
Create `.env.production` file:
```env
VITE_API_URL=https://doctor-appointment-backend.onrender.com
VITE_SOCKET_URL=https://doctor-appointment-backend.onrender.com
```

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Create a free account
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**: Add VITE_API_URL and VITE_SOCKET_URL
6. Click "Deploy"

### Step 4: Get Frontend URL
After deployment, Vercel will provide a URL like:
`https://doctor-appointment.vercel.app`

---

## Update Backend CORS Settings

After getting your frontend URL, update the backend environment variable:
- Set `FRONTEND_URL` to your Vercel URL
- Redeploy the backend on Render

---

## Alternative: Single Platform Deployment (Railway)

If you prefer everything in one place:

### Step 1: Go to Railway
1. Go to [Railway](https://railway.app/)
2. Create a free account

### Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Configure:
   - **Root Directory**: `backend`
   - **Add all environment variables**
4. Deploy

### Step 3: Deploy Frontend
1. In same project, click "New Service"
2. Select "Static Site"
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add VITE_API_URL and VITE_SOCKET_URL
4. Deploy

---

## Post-Deployment Checklist

- [ ] Backend is accessible and returns 200 on `/health` endpoint
- [ ] Frontend loads without errors
- [ ] User registration/login works
- [ ] Database connections are successful
- [ ] Redis connection is working
- [ ] File uploads work (Cloudinary)
- [ ] Email notifications work
- [ ] Socket.io connections work (if using real-time features)
- [ ] All API endpoints are accessible from frontend

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend matches your deployed frontend URL exactly
2. **Database Connection**: Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
3. **Redis Connection**: Verify Redis Cloud database is accessible
4. **Build Failures**: Check all dependencies are in package.json
5. **Environment Variables**: Ensure all required variables are set in production

### Logs

- **Render**: View logs in Render dashboard
- **Vercel**: View logs in Vercel dashboard → Deployments → Logs
- **Railway**: View logs in Railway dashboard

---

## Cost Summary (Free Tiers)

- MongoDB Atlas: Free (512MB storage)
- Redis Cloud: Free (25MB storage)
- Cloudinary: Free (25GB storage/month)
- Render: Free (750 hours/month)
- Vercel: Free (100GB bandwidth/month)
- Railway: Free ($5 credit/month)

**Total Monthly Cost: $0** (with free tiers)

---

## Security Recommendations

1. Use strong, unique secrets for JWT and refresh tokens
2. Enable MongoDB Atlas network access restrictions
3. Use environment-specific API keys
4. Enable rate limiting (already configured)
5. Keep dependencies updated
6. Use HTTPS (automatically provided by Render/Vercel)
7. Regularly review and audit logs

---

## Domain Configuration (Optional)

### Custom Domain for Frontend
1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard → Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### Custom Domain for Backend
1. In Render dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Monitoring and Analytics

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics
- **Uptime monitoring**: UptimeRobot (free)

---

## Backup Strategy

- MongoDB Atlas provides automated backups (paid tiers)
- Regular database exports using MongoDB Atlas tools
- Keep local backups of important configurations

---

## Scaling

When ready to scale:
- Upgrade MongoDB Atlas cluster
- Upgrade Redis Cloud plan
- Add multiple backend instances (Render supports auto-scaling)
- Use CDN for static assets (Vercel provides this)
- Implement load balancing

---

## Support

For deployment issues:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Redis Cloud: https://redis.com/redis-enterprise-cloud/redis-cloud-documentation/

