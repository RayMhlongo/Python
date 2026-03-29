require("dotenv").config();

const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { SQLiteStore } = require("./sqlite-store");
const { RoomManager } = require("./room-manager");

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.resolve(__dirname, "..");
const ASSET_DIR = path.join(ROOT_DIR, "assets");
const store = new SQLiteStore();
const manager = new RoomManager(store);
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const roomSweepInterval = setInterval(() => {
  const changedRooms = manager.sweepExpired();
  changedRooms.forEach((roomId) => {
    emitRoomState(roomId);
  });
}, 5000);
let shuttingDown = false;

app.use("/assets", express.static(ASSET_DIR));

app.get("/", (_request, response) => {
  response.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/index.html", (_request, response) => {
  response.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/api/health", async (_request, response) => {
  response.json({
    ok: true,
    persistenceBackend: store.kind,
    persistenceEnabled: store.enabled,
    persistenceError: store.enabled ? "" : store.error,
    databasePath: store.databasePath || ""
  });
});

app.get("/health", async (_request, response) => {
  response.json({
    ok: true,
    persistenceBackend: store.kind,
    persistenceEnabled: store.enabled
  });
});

app.get("/api/leaderboard", async (_request, response) => {
  response.json(await manager.getLeaderboard());
});

app.get("/api/history/recent", async (_request, response) => {
  response.json(store.getRecentRounds());
});

async function emitRoomState(roomId) {
  const preview = manager.getPreview(roomId);

  if (preview.ok) {
    io.to(preview.roomId).emit("room:state", preview.state);
  }
}

async function emitLeaderboard(targetSocket = null) {
  const payload = await manager.getLeaderboard();

  if (targetSocket) {
    targetSocket.emit("leaderboard:update", payload);
    return;
  }

  io.emit("leaderboard:update", payload);
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
    connected: true,
    persistenceBackend: store.kind,
    persistenceEnabled: store.enabled,
    persistenceError: store.enabled ? "" : store.error,
    databasePath: store.databasePath || ""
  });

  emitLeaderboard(socket);

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
      await emitLeaderboard();

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
        await emitLeaderboard();
      }

      return result;
    })
  );

  socket.on("leaderboard:request", async () => {
    await emitLeaderboard(socket);
  });

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
      store.close();
      process.exit(0);
    });
  });

  setTimeout(() => {
    store.close();
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen(PORT, () => {
  const persistenceState = store.enabled
    ? `SQLite persistence enabled at ${store.databasePath}`
    : `SQLite persistence disabled: ${store.error}`;
  console.log(`Pyte room server listening on http://localhost:${PORT}`);
  console.log(persistenceState);
});
