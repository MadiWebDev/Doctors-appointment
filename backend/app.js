import express from "express";
import { errorMiddleWare } from "./Middleware/error.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import userRoutesV1 from "./Routes/v1/userRoutes.js";
import doctorRoutesV1 from "./Routes/v1/doctorRoutes.js";
import appointmentRoutesV1 from "./Routes/v1/appointmentRoutes.js";
import uploadRoutesV1 from "./Routes/v1/uploadRoutes.js";
import notificationRoutesV1 from "./Routes/v1/notificationRoutes.js";
import adminRoutesV1 from "./Routes/v1/adminRoutes.js";
import patientRoutesV1 from "./Routes/v1/patientRoutes.js";
import medicalRecordRoutesV1 from "./Routes/v1/medicalRecordRoutes.js";
import prescriptionRoutesV1 from "./Routes/v1/prescriptionRoutes.js";
import messageRoutesV1 from "./Routes/v1/messageRoutes.js";
import slotRoutesV1 from "./Routes/v1/slotRoutes.js";
import specializationRoutesV1 from "./Routes/v1/specializationRoutes.js";
import adminAnalyticsRoutesV1 from "./Routes/v1/adminAnalyticsRoutes.js";

const app = express();  

// Security middleware 
app.use(helmet({ 
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Compression middleware
app.use(compression());
 
// API Routes with versioning
app.use("/api/v1/user", userRoutesV1);
app.use("/api/v1/doctor", doctorRoutesV1);
app.use("/api/v1/appointment", appointmentRoutesV1);
app.use("/api/v1/upload", uploadRoutesV1);
app.use("/api/v1/notification", notificationRoutesV1);
app.use("/api/v1/admin", adminRoutesV1);
app.use("/api/v1/admin/analytics", adminAnalyticsRoutesV1);
app.use("/api/v1/patient", patientRoutesV1);
app.use("/api/v1/medical-record", medicalRecordRoutesV1);
app.use("/api/v1/prescription", prescriptionRoutesV1);
app.use("/api/v1/message", messageRoutesV1);
app.use("/api/v1/slot", slotRoutesV1);
app.use("/api/v1/specialization", specializationRoutesV1);

// Health check endpoint  
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleWare);

export default app;