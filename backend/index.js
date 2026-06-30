import app from "./app.js";
import dotenv from "dotenv";
import { dataBaseDB } from "./Config/database.js";
import { initializeSocket } from "./socket/socket.js";
import { connectRedis } from "./Config/redis.js";
import { initializeSchedulers } from "./utilis/emailScheduler.js";

dotenv.config();
// Connecting to data base
dataBaseDB();

// Connect to Redis (optional - won't fail if not configured)
connectRedis().catch(err => {
  console.warn('⚠️ Redis connection failed (optional):', err.message);
});

// Initialize email schedulers (optional - won't fail if not configured)
try {
  initializeSchedulers();
} catch (error) {
  console.warn('⚠️ Email schedulers initialization failed (optional):', error.message);
}

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception`);
  process.exit(1);
});

const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});

// Initialize Socket.io
initializeSocket(server);

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
