import app from "./app.js";
import dotenv from "dotenv";
import cors from "cors";
import { dataBaseDB } from "./Config/database.js";

dotenv.config();
// Connecting to data base
dataBaseDB();

app.use(cors());
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

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
