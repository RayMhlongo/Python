const { randomUUID } = require("crypto");
const { evaluateChallenge, pickRandomChallenge } = require("./room-challenges");

const IDENTITIES = ["Angel", "Beloved"];
const DISCONNECT_GRACE_MS = 60000;
const MAX_CHAT_MESSAGES = 60;
const MAX_ROUND_HISTORY = 12;
const FIRST_CORRECT_BONUS = 3;

function normalizeRoomId(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toUpperCase()
    .slice(0, 24);
}

function makeSystemMessage(text) {
  return {
    id: randomUUID(),
    kind: "system",
    text,
    createdAt: Date.now()
  };
}

class RoomManager {
  constructor(store) {
    this.store = store;
    this.rooms = new Map();
    this.socketIndex = new Map();
  }

  getPreview(roomIdInput) {
    const roomId = normalizeRoomId(roomIdInput);

    if (!roomId) {
      return {
        ok: false,
        code: "invalid_room",
        message: "Enter a room code first."
      };
    }

    this.sweepRoom(roomId);
    const room = this.rooms.get(roomId);

    return {
      ok: true,
      roomId,
      state: this.serializeRoom(roomId, room)
    };
  }

  joinRoom({ roomIdInput, identity, sessionToken, socketId }) {
    const roomId = normalizeRoomId(roomIdInput);

    if (!roomId) {
      return { ok: false, code: "invalid_room", message: "Enter a valid room code." };
    }

    if (!IDENTITIES.includes(identity)) {
      return { ok: false, code: "invalid_identity", message: "Choose Angel or Beloved." };
    }

    if (!sessionToken) {
      return { ok: false, code: "missing_session", message: "Missing session token." };
    }

    this.sweepRoom(roomId);
    const room = this.ensureRoom(roomId);
    const existingIdentity = this.findIdentityBySession(room, sessionToken);
    const occupant = room.participants.get(identity);

    if (existingIdentity && existingIdentity !== identity) {
      return {
        ok: false,
        code: "identity_locked",
        message: `This session already joined ${roomId} as ${existingIdentity}. Leave first to switch names.`,
        state: this.serializeRoom(roomId, room)
      };
    }

    if (occupant && occupant.sessionToken !== sessionToken) {
      if (this.availableIdentities(room).length === 0) {
        return {
          ok: false,
          code: "room_full",
          message: `${roomId} is full right now.`,
          state: this.serializeRoom(roomId, room)
        };
      }

      return {
        ok: false,
        code: "identity_taken",
        message: `${identity} is already taken in ${roomId}.`,
        state: this.serializeRoom(roomId, room)
      };
    }

    const now = Date.now();
    const participant = occupant || {
      identity,
      sessionToken,
      connectedAt: now,
      joinedAt: now
    };

    participant.identity = identity;
    participant.sessionToken = sessionToken;
    participant.socketId = socketId;
    participant.connectedAt = now;
    participant.disconnectedAt = null;
    participant.disconnectDeadline = null;
    participant.status = "connected";

    room.participants.set(identity, participant);
    this.socketIndex.set(socketId, { roomId, identity });

    const joinText = occupant
      ? `${identity} reconnected to the room.`
      : `${identity} joined the room.`;

    this.appendChatMessage(room, makeSystemMessage(joinText));
    room.updatedAt = now;

    return {
      ok: true,
      roomId,
      identity,
      state: this.serializeRoom(roomId, room)
    };
  }

  leaveRoom(socketId) {
    const membership = this.socketIndex.get(socketId);

    if (!membership) {
      return null;
    }

    const { roomId, identity } = membership;
    const room = this.rooms.get(roomId);
    this.socketIndex.delete(socketId);

    if (!room) {
      return null;
    }

    room.participants.delete(identity);
    room.updatedAt = Date.now();
    this.appendChatMessage(room, makeSystemMessage(`${identity} left the room.`));
    this.cleanupEmptyRoom(roomId);

    return {
      roomId,
      state: this.serializeRoom(roomId, this.rooms.get(roomId))
    };
  }

  markDisconnected(socketId) {
    const membership = this.socketIndex.get(socketId);

    if (!membership) {
      return null;
    }

    const { roomId, identity } = membership;
    const room = this.rooms.get(roomId);
    this.socketIndex.delete(socketId);

    if (!room) {
      return null;
    }

    const participant = room.participants.get(identity);

    if (!participant) {
      return null;
    }

    participant.status = "reconnecting";
    participant.socketId = null;
    participant.disconnectedAt = Date.now();
    participant.disconnectDeadline = participant.disconnectedAt + DISCONNECT_GRACE_MS;
    room.updatedAt = Date.now();

    this.appendChatMessage(room, makeSystemMessage(`${identity} lost connection. Holding the seat for reconnection.`));

    return {
      roomId,
      state: this.serializeRoom(roomId, room)
    };
  }

  sendChatMessage(socketId, text) {
    const membership = this.socketIndex.get(socketId);

    if (!membership) {
      return { ok: false, message: "Join a room before sending a message." };
    }

    const room = this.rooms.get(membership.roomId);

    if (!room) {
      return { ok: false, message: "Room not found." };
    }

    const message = String(text || "").trim();

    if (!message) {
      return { ok: false, message: "Type a message before sending." };
    }

    this.appendChatMessage(room, {
      id: randomUUID(),
      kind: "user",
      identity: membership.identity,
      text: message,
      createdAt: Date.now()
    });
    room.updatedAt = Date.now();

    return {
      ok: true,
      roomId: membership.roomId,
      state: this.serializeRoom(membership.roomId, room)
    };
  }

  startChallenge(socketId) {
    const membership = this.socketIndex.get(socketId);

    if (!membership) {
      return { ok: false, message: "Join a room before starting a challenge." };
    }

    const room = this.rooms.get(membership.roomId);

    if (!room) {
      return { ok: false, message: "Room not found." };
    }

    const connectedCount = Array.from(room.participants.values()).filter((participant) => participant.status === "connected").length;

    if (connectedCount < 2) {
      return { ok: false, message: "Both Angel and Beloved need to be connected before a challenge can start." };
    }

    if (room.activeChallenge && room.activeChallenge.status === "active") {
      return { ok: false, message: "A challenge is already active in this room." };
    }

    const previousIds = room.roundHistory.map((item) => item.challenge.id).slice(-4);
    const round = pickRandomChallenge(previousIds);

    room.activeChallenge = {
      roundId: round.roundId,
      startedAt: Date.now(),
      startedBy: membership.identity,
      status: "active",
      challenge: round.challenge,
      internal: round.internal,
      submissions: {}
    };

    this.appendChatMessage(room, makeSystemMessage(`${membership.identity} started the challenge "${round.challenge.title}".`));
    room.updatedAt = Date.now();

    return {
      ok: true,
      roomId: membership.roomId,
      state: this.serializeRoom(membership.roomId, room)
    };
  }

  async submitChallenge(socketId, answer) {
    const membership = this.socketIndex.get(socketId);

    if (!membership) {
      return { ok: false, message: "Join a room before submitting an answer." };
    }

    const room = this.rooms.get(membership.roomId);

    if (!room || !room.activeChallenge) {
      return { ok: false, message: "There is no active challenge yet." };
    }

    if (room.activeChallenge.status !== "active") {
      return { ok: false, message: "This round is already complete. Start a new challenge." };
    }

    const trimmed = String(answer || "").trim();

    if (!trimmed) {
      return { ok: false, message: "Enter an answer before submitting." };
    }

    if (room.activeChallenge.submissions[membership.identity]) {
      return { ok: false, message: "This identity has already submitted for the current round." };
    }

    room.activeChallenge.submissions[membership.identity] = {
      identity: membership.identity,
      submittedAt: Date.now(),
      submittedAnswer: trimmed
    };
    room.updatedAt = Date.now();

    this.appendChatMessage(room, makeSystemMessage(`${membership.identity} submitted an answer.`));

    const allRequired = IDENTITIES.filter((identity) => {
      const participant = room.participants.get(identity);
      return participant && participant.status === "connected";
    });

    if (allRequired.every((identity) => room.activeChallenge.submissions[identity])) {
      await this.finalizeRound(membership.roomId, room);
    }

    return {
      ok: true,
      roomId: membership.roomId,
      state: this.serializeRoom(membership.roomId, room),
      leaderboard: await this.store.getLeaderboard()
    };
  }

  async finalizeRound(roomId, room) {
    if (!room.activeChallenge || room.activeChallenge.status !== "active") {
      return;
    }

    const challenge = room.activeChallenge.challenge;
    const internal = room.activeChallenge.internal;
    const submissions = room.activeChallenge.submissions;

    const results = IDENTITIES.map((identity) => {
      const submission = submissions[identity];
      const evaluation = submission ? evaluateChallenge(internal, submission.submittedAnswer) : { correct: false, normalizedAnswer: "", submittedAnswer: "" };

      return {
        identity,
        submittedAt: submission ? submission.submittedAt : null,
        submittedAnswer: submission ? submission.submittedAnswer : "",
        correct: evaluation.correct,
        normalizedAnswer: evaluation.normalizedAnswer,
        pointsAwarded: 0,
        isWinner: false
      };
    });

    const correctResults = results
      .filter((result) => result.correct && result.submittedAt)
      .sort((left, right) => left.submittedAt - right.submittedAt);

    const firstCorrectIdentity = correctResults.length ? correctResults[0].identity : null;

    for (const result of results) {
      if (result.correct) {
        result.pointsAwarded = challenge.points + (result.identity === firstCorrectIdentity ? FIRST_CORRECT_BONUS : 0);
      }
    }

    const highestPoints = Math.max(...results.map((result) => result.pointsAwarded));
    const winners = results.filter((result) => highestPoints > 0 && result.pointsAwarded === highestPoints);

    if (winners.length === 1) {
      winners[0].isWinner = true;
    }

    for (const result of results) {
      room.sessionScores[result.identity] += result.pointsAwarded;
    }

    const roundSummary = {
      roundId: room.activeChallenge.roundId,
      challenge,
      startedBy: room.activeChallenge.startedBy,
      completedAt: Date.now(),
      explanation: challenge.explanation,
      results
    };

    room.roundHistory.unshift(roundSummary);
    room.roundHistory = room.roundHistory.slice(0, MAX_ROUND_HISTORY);
    room.activeChallenge = {
      ...room.activeChallenge,
      status: "round_complete",
      completedAt: roundSummary.completedAt,
      results,
      explanation: challenge.explanation
    };
    room.updatedAt = Date.now();

    const winnerText = winners.length === 1
      ? `${winners[0].identity} won the round.`
      : "Round complete. No single winner this time.";

    this.appendChatMessage(room, makeSystemMessage(winnerText));

    await this.store.applyRoundResult({
      roomId,
      roundId: roundSummary.roundId,
      challenge,
      results,
      sessionScores: room.sessionScores
    });
  }

  async getLeaderboard() {
    return this.store.getLeaderboard();
  }

  sweepExpired() {
    const changedRoomIds = [];

    for (const [roomId, room] of this.rooms.entries()) {
      if (this.sweepRoom(roomId, room)) {
        changedRoomIds.push(roomId);
      }
    }

    return changedRoomIds;
  }

  sweepRoom(roomId, existingRoom) {
    const room = existingRoom || this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    const now = Date.now();
    let changed = false;

    for (const [identity, participant] of room.participants.entries()) {
      if (participant.status === "reconnecting" && participant.disconnectDeadline && participant.disconnectDeadline <= now) {
        room.participants.delete(identity);
        this.appendChatMessage(room, makeSystemMessage(`${identity} left the room.`));
        changed = true;
      }
    }

    this.cleanupEmptyRoom(roomId);
    return changed;
  }

  cleanupEmptyRoom(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  ensureRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        chat: [],
        sessionScores: {
          Angel: 0,
          Beloved: 0
        },
        roundHistory: [],
        activeChallenge: null,
        updatedAt: Date.now()
      });
    }

    return this.rooms.get(roomId);
  }

  appendChatMessage(room, message) {
    room.chat.push(message);
    room.chat = room.chat.slice(-MAX_CHAT_MESSAGES);
  }

  availableIdentities(room) {
    return IDENTITIES.filter((identity) => !room.participants.has(identity));
  }

  findIdentityBySession(room, sessionToken) {
    for (const participant of room.participants.values()) {
      if (participant.sessionToken === sessionToken) {
        return participant.identity;
      }
    }

    return "";
  }

  serializeRoom(roomId, room) {
    const base = {
      roomId,
      identities: IDENTITIES,
      availableIdentities: IDENTITIES,
      roomFull: false,
      participants: IDENTITIES.map((identity) => ({
        identity,
        status: "open",
        connected: false,
        joinedAt: null
      })),
      chat: [],
      sessionScores: {
        Angel: 0,
        Beloved: 0
      },
      roundHistory: [],
      activeChallenge: null,
      roomStatus: "waiting_for_players"
    };

    if (!room) {
      return base;
    }

    const participants = IDENTITIES.map((identity) => {
      const participant = room.participants.get(identity);

      return {
        identity,
        status: participant ? participant.status : "open",
        connected: Boolean(participant && participant.status === "connected"),
        joinedAt: participant ? participant.joinedAt : null
      };
    });

    let roomStatus = "waiting_for_players";

    if (room.activeChallenge && room.activeChallenge.status === "active") {
      roomStatus = "challenge_active";
    } else if (room.activeChallenge && room.activeChallenge.status === "round_complete") {
      roomStatus = "round_complete";
    } else if (participants.every((participant) => participant.status !== "open")) {
      roomStatus = "ready";
    }

    return {
      roomId,
      identities: IDENTITIES,
      availableIdentities: this.availableIdentities(room),
      roomFull: this.availableIdentities(room).length === 0,
      participants,
      chat: room.chat,
      sessionScores: room.sessionScores,
      roundHistory: room.roundHistory,
      activeChallenge: room.activeChallenge
        ? {
            roundId: room.activeChallenge.roundId,
            startedAt: room.activeChallenge.startedAt,
            startedBy: room.activeChallenge.startedBy,
            status: room.activeChallenge.status,
            challenge: room.activeChallenge.challenge,
            submissions: IDENTITIES.reduce((accumulator, identity) => {
              accumulator[identity] = room.activeChallenge.submissions[identity]
                ? { submitted: true }
                : { submitted: false };
              return accumulator;
            }, {}),
            results: room.activeChallenge.results || [],
            explanation: room.activeChallenge.explanation || ""
          }
        : null,
      roomStatus,
      updatedAt: room.updatedAt
    };
  }
}

module.exports = {
  RoomManager,
  IDENTITIES,
  normalizeRoomId
};
