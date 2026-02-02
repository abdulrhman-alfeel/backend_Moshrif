const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

// Socket.IO (scalable)
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : true,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000,
});

// Enable horizontal scaling via Redis Adapter when REDIS_URL is present.
// Note: With multiple node instances behind nginx, use sticky sessions (ip_hash) or a sticky LB.
async function attachRedisAdapterIfConfigured() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return;

  try {
    const { createClient } = require("redis");
    const { createAdapter } = require("@socket.io/redis-adapter");
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Socket.IO Redis adapter enabled");
  } catch (err) {
    console.error("❌ Failed to enable Socket.IO Redis adapter:", err);
  }
}

attachRedisAdapterIfConfigured();

// Trust proxy (behind nginx)
app.set("trust proxy", true);

module.exports = { express, app, http, server, io };
// d