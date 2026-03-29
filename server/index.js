require("dotenv").config();

const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { RoomManager } = require("./room-manager");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.resolve(__dirname, "..");
const ASSET_DIR = path.join(ROOT_DIR, "assets");
const manager = new RoomManager();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});
const roomSweepInterval = setInterval(() => {
  const changedRooms = manager.sweepExpired();
  changedRooms.forEach((roomId) => {
    emitRoomState(roomId);
  });
}, 5000);
let shuttingDown = false;

app.use("/assets", express.static(ASSET_DIR));

function sendPage(response, pageName) {
  response.sendFile(path.join(ROOT_DIR, pageName));
}

app.get("/", (_request, response) => {
  sendPage(response, "index.html");
});

app.get("/index.html", (_request, response) => {
  sendPage(response, "index.html");
});

app.get("/practice", (_request, response) => {
  sendPage(response, "practice.html");
});

app.get("/practice.html", (_request, response) => {
  sendPage(response, "practice.html");
});

app.get("/room", (_request, response) => {
  sendPage(response, "room.html");
});

app.get("/room.html", (_request, response) => {
  sendPage(response, "room.html");
});

app.get("/solo", (_request, response) => {
  sendPage(response, "solo.html");
});

app.get("/solo.html", (_request, response) => {
  sendPage(response, "solo.html");
});

app.get("/api/health", async (_request, response) => {
  response.json({
    ok: true
  });
});

app.get("/health", async (_request, response) => {
  response.json({
    ok: true
  });
});

async function emitRoomState(roomId) {
  const preview = manager.getPreview(roomId);

  if (preview.ok) {
    io.to(preview.roomId).emit("room:state", preview.state);
  }
}

function withAck(callback) {
  return async (...args) => {
    const ack = typeof args[args.length - 1] === "function" ? args.pop() : null;

    try {
      const result = await callback(...args);

      if (ack) {
        ack(result);
      }
    } catch (error) {
      if (ack) {
        ack({
          ok: false,
          message: "Something went wrong while processing that request."
        });
      }
    }
  };
}

io.on("connection", (socket) => {
  socket.emit("socket:status", {
    connected: true
  });

  socket.on(
    "room:preview",
    withAck(async (payload) => {
      const result = manager.getPreview(payload.roomId);
      return result;
    })
  );

  socket.on(
    "room:join",
    withAck(async (payload) => {
      const result = manager.joinRoom({
        roomIdInput: payload.roomId,
        identity: payload.identity,
        sessionToken: payload.sessionToken,
        socketId: socket.id
      });

      if (!result.ok) {
        return result;
      }

      socket.join(result.roomId);
      await emitRoomState(result.roomId);

      return result;
    })
  );

  socket.on(
    "room:leave",
    withAck(async () => {
      const result = manager.leaveRoom(socket.id);

      if (result && result.roomId) {
        socket.leave(result.roomId);
        await emitRoomState(result.roomId);
      }

      return {
        ok: true
      };
    })
  );

  socket.on(
    "chat:send",
    withAck(async (payload) => {
      const result = manager.sendChatMessage(socket.id, payload.text);

      if (result.ok) {
        await emitRoomState(result.roomId);
      }

      return result;
    })
  );

  socket.on(
    "challenge:start",
    withAck(async () => {
      const result = manager.startChallenge(socket.id);

      if (result.ok) {
        await emitRoomState(result.roomId);
      }

      return result;
    })
  );

  socket.on(
    "challenge:submit",
    withAck(async (payload) => {
      const result = await manager.submitChallenge(socket.id, payload.answer);

      if (result.ok) {
        await emitRoomState(result.roomId);
      }

      return result;
    })
  );

  socket.on("disconnect", async () => {
    const result = manager.markDisconnected(socket.id);

    if (result && result.roomId) {
      await emitRoomState(result.roomId);
    }
  });
});

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  clearInterval(roomSweepInterval);
  console.log(`${signal} received. Shutting down Pyte room server...`);

  io.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen(PORT, () => {
  console.log(`Pyte room server listening on http://localhost:${PORT}`);
});
