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
        return next(new Error("Authentication error: no token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: user not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userName = socket.user.name || "Unknown";
    console.log(`User connected: ${userName} (${socket.id})`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // If user is a doctor, join doctor's room and update online status
    if (socket.user.role === "doctor") {
      socket.join(`doctor_${socket.user._id}`);
      updateDoctorOnlineStatus(socket.user._id, true);
    }

    // ── Appointment room ──────────────────────────────────────────────────
    socket.on("join_appointment", (appointmentId) => {
      socket.join(`appointment_${appointmentId}`);
    });

    socket.on("leave_appointment", (appointmentId) => {
      socket.leave(`appointment_${appointmentId}`);
    });

    // ── Chat messages ─────────────────────────────────────────────────────
    socket.on("send_message", (data) => {
      const { appointmentId, message, receiverId } = data;

      const messageData = {
        senderId: socket.user._id,
        senderName: socket.user.name,
        senderRole: socket.user.role,
        message,
        timestamp: new Date(),
        appointmentId,
      };

      // Send to receiver
      io.to(`user_${receiverId}`).emit("receive_message", messageData);

      // Echo to sender's other devices
      socket.to(`user_${socket.user._id}`).emit("receive_message", messageData);
    });

    // ── Typing indicators ────────────────────────────────────────────────
    socket.on("typing_start", ({ appointmentId, receiverId }) => {
      io.to(`user_${receiverId}`).emit("user_typing", {
        appointmentId,
        userId: socket.user._id,
        userName: socket.user.name,
      });
    });

    socket.on("typing_stop", ({ appointmentId, receiverId }) => {
      io.to(`user_${receiverId}`).emit("user_stopped_typing", {
        appointmentId,
        userId: socket.user._id,
      });
    });

    // ── Appointment status updates ────────────────────────────────────────
    socket.on("appointment_status_update", ({ appointmentId, status, doctorId, patientId }) => {
      io.to(`user_${patientId}`).emit("appointment_updated", {
        appointmentId,
        status,
        message: `Your appointment has been ${status}`,
      });
      io.to(`doctor_${doctorId}`).emit("appointment_updated", { appointmentId, status });
    });

    // ── New appointment booking notification ─────────────────────────────
    socket.on("new_appointment", ({ appointmentId, doctorId }) => {
      io.to(`doctor_${doctorId}`).emit("appointment_booked", {
        appointmentId,
        message: "You have a new appointment booking",
      });
    });

    // ── Video consultation ────────────────────────────────────────────────
    socket.on("video_consultation_start", ({ appointmentId, meetingUrl, patientId }) => {
      io.to(`user_${patientId}`).emit("video_call_started", {
        appointmentId,
        meetingUrl,
        message: "Your video consultation is starting",
      });
    });

    // ── Doctor online status ─────────────────────────────────────────────
    socket.on("update_online_status", async (isOnline) => {
      if (socket.user.role === "doctor") {
        await updateDoctorOnlineStatus(socket.user._id, isOnline);
        io.emit("doctor_status_changed", {
          doctorId: socket.user._id,
          isOnline,
        });
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);

      if (socket.user.role === "doctor") {
        await updateDoctorOnlineStatus(socket.user._id, false);
        io.emit("doctor_status_changed", {
          doctorId: socket.user._id,
          isOnline: false,
        });
      }
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.user.name}:`, error);
    });
  });

  return io;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const updateDoctorOnlineStatus = async (userId, isOnline) => {
  try {
    await Doctor.findOneAndUpdate(
      { user: userId },
      {
        isOnline,
        lastOnline: isOnline ? undefined : new Date(),
      }
    );
  } catch (error) {
    console.error("Error updating doctor online status:", error);
  }
};

export const sendNotification = (userId, notificationData) => {
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", notificationData);
  }
};

export const broadcastMessage = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export const sendToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

export const getIO = () => io;
