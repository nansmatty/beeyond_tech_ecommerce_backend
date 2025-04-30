import { Server } from "socket.io";
import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db";
import http from "http";
import { setupSocketHandlers } from "./socket/setupSocketHandler";

const startServer = () => {
  const PORT = Config.PORT || 5000;

  connectDB();

  try {
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        credentials: true,
      },
    });

    setupSocketHandlers(io);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port -- ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
