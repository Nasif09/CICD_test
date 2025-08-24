const app = require("./app");
require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./helpers/logger");
const cors = require("cors");
const { seedAdmin } = require("./seeder/seed");

// app.use(cors({
//   origin: true,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

let server = null;
const port = process.env.BACKEND_PORT || 3001;
const serverIP = process.env.API_SERVER_IP || "localhost";
const appName = process.env.APPNAME || "real-estate";

async function myServer() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION);
    await seedAdmin();
    server = app.listen(port, () => {
      console.dir(
        `---> 🏢  ${appName}🏢  server is listening on : http://${serverIP}:${port}`
      );
    });
  } catch (error) {
    console.error("💀 Server start error:", error);
    logger.error({
      message: error.message,
      status: error.status || 500,
      method: "server-start",
      url: "server-start",
      stack: error.stack,
    });
    process.exit(1);
  }
}

myServer();

async function graceful(err) {
  console.error("Received shutdown signal or error:", err);
  logger.error({
    message: err.message,
    status: err.status || 500,
    method: "graceful",
    url: "server.js -> graceful",
    stack: err.stack,
  });
  if (server) {
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
process.on("uncaughtException", graceful);
