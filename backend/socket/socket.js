import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";
import Doctor from "../Models/doctorModels.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name || socket.user.username} (${socket.id})`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // If user is a doctor, join doctor's room
    if (socket.user.role === "doctor") {
      socket.join(`doctor_${socket.user._id}`);
      updateDoctorOnlineStatus(socket.user._id, true);
    }

    // Handle joining appointment room
    socket.on("join_appointment", (appointmentId) => {
      socket.join(`appointment_${appointmentId}`);
      console.log(`User ${socket.user.name || socket.user.username} joined appointment ${appointmentId}`);
    });

    // Handle leaving appointment room
    socket.on("leave_appointment", (appointmentId) => {
      socket.leave(`appointment_${appointmentId}`);
      console.log(`User ${socket.user.name || socket.user.username} left appointment ${appointmentId}`);
    });

    // Handle chat messages
    socket.on("send_message", async (data) => {
      const { appointmentId, message, receiverId } = data;

      const messageData = {
        senderId: socket.user._id,
        senderName: socket.user.name || socket.user.username,
        senderRole: socket.user.role,
        message,
        timestamp: new Date(),
      };

      // Send to receiver
      io.to(`user_${receiverId}`).emit("receive_message", {
        ...messageData,
        appointmentId,
      });

      // Also send to sender's other devices
      socket.to(`user_${socket.user._id}`).emit("receive_message", {
        ...messageData,
        appointmentId,
      });
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { appointmentId, receiverId } = data;
      io.to(`user_${receiverId}`).emit("user_typing", {
        appointmentId,
        userId: socket.user._id,
        userName: socket.user.name || socket.user.username,
      });
    });

    socket.on("typing_stop", (data) => {
      const { appointmentId, receiverId } = data;
      io.to(`user_${receiverId}`).emit("user_stopped_typing", {
        appointmentId,
        userId: socket.user._id,
      });
    });

    // Handle appointment status updates
    socket.on("appointment_status_update", (data) => {
      const { appointmentId, status, doctorId, patientId } = data;
      
      // Notify patient
      io.to(`user_${patientId}`).emit("appointment_updated", {
        appointmentId,
        status,
        message: `Your appointment has been ${status}`,
      });

      // Notify doctor
      io.to(`doctor_${doctorId}`).emit("appointment_updated", {
        appointmentId,
        status,
      });
    });

    // Handle new appointment booking
    socket.on("new_appointment", (data) => {
      const { appointmentId, doctorId } = data;
      
      // Notify doctor
      io.to(`doctor_${doctorId}`).emit("appointment_booked", {
        appointmentId,
        message: "You have a new appointment booking",
      });
    });

    // Handle video consultation start
    socket.on("video_consultation_start", (data) => {
      const { appointmentId, meetingUrl, patientId } = data;
      
      io.to(`user_${patientId}`).emit("video_call_started", {
        appointmentId,
        meetingUrl,
        message: "Your video consultation is starting",
      });
    });

    // Handle doctor online status change
    socket.on("update_online_status", async (isOnline) => {
      if (socket.user.role === "doctor") {
        await updateDoctorOnlineStatus(socket.user._id, isOnline);
        
        // Broadcast to all connected users
        io.emit("doctor_status_changed", {
          doctorId: socket.user._id,
          isOnline,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.name || socket.user.username} (${socket.id})`);
      
      if (socket.user.role === "doctor") {
        await updateDoctorOnlineStatus(socket.user._id, false);
        io.emit("doctor_status_changed", {
          doctorId: socket.user._id,
          isOnline: false,
        });
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.user.name || socket.user.username}:`, error);
    });
  });

  return io;
};

// Helper function to update doctor online status in database
const updateDoctorOnlineStatus = async (userId, isOnline) => {
  try {
    await Doctor.findOneAndUpdate(
      { user: userId },
      {
        isOnline,
        lastOnline: isOnline ? new Date() : undefined,
      }
    );
  } catch (error) {
    console.error("Error updating doctor online status:", error);
  }
};

// Helper function to send notification to specific user
export const sendNotification = (userId, notificationData) => {
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", notificationData);
  }
};

// Helper function to broadcast to all connected users
export const broadcastMessage = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Helper function to send to specific room
export const sendToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

export const getIO = () => io;
