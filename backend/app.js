import "dotenv/config";
import { connectDB } from "./src/config/mongo.config.js";
import { startOrderTimeoutWorker } from "./src/services/orderTimeout.service.js";
import { createApp } from "./src/app.create.js";
import { Server } from "socket.io";
import { socketActions } from "./src/controllers/socket.contoller.js";
export { errorLogStream } from "./src/config/logger.config.js";

const app = createApp();

await connectDB();
startOrderTimeoutWorker();

const server = app.listen(process.env.PORT, () => {
  console.log("Server listening on http://localhost:" + process.env.PORT);
});

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", socketActions);