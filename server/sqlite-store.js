const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

function createDefaultStats(identity) {
  return {
    identity,
    totalPoints: 0,
    totalChallengesAttempted: 0,
    totalCorrectAnswers: 0,
    totalWins: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    updatedAt: null
  };
}

function resolveDatabasePath(databasePathInput) {
  if (databasePathInput && path.isAbsolute(databasePathInput)) {
    return databasePathInput;
  }

  const relativePath = databasePathInput || path.join("data", "pyte-room.sqlite");
  return path.resolve(__dirname, "..", relativePath);
}

class SQLiteStore {
  constructor(options = {}) {
    this.kind = "sqlite";
    this.label = "SQLite";
    this.enabled = false;
    this.error = "";
    this.db = null;
    this.databasePath = "";
    this.statements = {};
    this.initialize(options.databasePath || process.env.SQLITE_PATH);
  }

  initialize(databasePathInput) {
    try {
      this.databasePath = resolveDatabasePath(databasePathInput);
      fs.mkdirSync(path.dirname(this.databasePath), { recursive: true });

      this.db = new DatabaseSync(this.databasePath);
      this.db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS leaderboard (
          identity TEXT PRIMARY KEY,
          total_points INTEGER NOT NULL DEFAULT 0,
          total_challenges_attempted INTEGER NOT NULL DEFAULT 0,
          total_correct_answers INTEGER NOT NULL DEFAULT 0,
          total_wins INTEGER NOT NULL DEFAULT 0,
          current_win_streak INTEGER NOT NULL DEFAULT 0,
          best_win_streak INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS challenge_history (
          round_id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          challenge_id TEXT NOT NULL,
          challenge_title TEXT NOT NULL,
          challenge_type TEXT NOT NULL,
          challenge_difficulty TEXT NOT NULL,
          challenge_points INTEGER NOT NULL DEFAULT 0,
          explanation TEXT NOT NULL DEFAULT '',
          challenge_json TEXT NOT NULL,
          results_json TEXT NOT NULL,
          session_scores_json TEXT NOT NULL,
          finalized_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS room_history (
          room_id TEXT PRIMARY KEY,
          participants_json TEXT NOT NULL DEFAULT '[]',
          total_rounds INTEGER NOT NULL DEFAULT 0,
          last_round_id TEXT,
          last_challenge_title TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_leaderboard_points
          ON leaderboard(total_points DESC, total_wins DESC, identity ASC);

        CREATE INDEX IF NOT EXISTS idx_challenge_history_room
          ON challenge_history(room_id, finalized_at DESC);

        CREATE INDEX IF NOT EXISTS idx_challenge_history_recent
          ON challenge_history(finalized_at DESC);
      `);

      this.prepareStatements();
      this.enabled = true;
    } catch (error) {
      this.enabled = false;
      this.error = error.message;
    }
  }

  prepareStatements() {
    this.statements.selectLeaderboard = this.db.prepare(`
      SELECT
        identity,
        total_points,
        total_challenges_attempted,
        total_correct_answers,
        total_wins,
        current_win_streak,
        best_win_streak,
        updated_at
      FROM leaderboard
      ORDER BY total_points DESC, total_wins DESC, identity ASC
      LIMIT ?
    `);

    this.statements.selectPlayer = this.db.prepare(`
      SELECT
        identity,
        total_points,
        total_challenges_attempted,
        total_correct_answers,
        total_wins,
        current_win_streak,
        best_win_streak,
        updated_at
      FROM leaderboard
      WHERE identity = ?
    `);

    this.statements.upsertPlayer = this.db.prepare(`
      INSERT INTO leaderboard (
        identity,
        total_points,
        total_challenges_attempted,
        total_correct_answers,
        total_wins,
        current_win_streak,
        best_win_streak,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(identity) DO UPDATE SET
        total_points = excluded.total_points,
        total_challenges_attempted = excluded.total_challenges_attempted,
        total_correct_answers = excluded.total_correct_answers,
        total_wins = excluded.total_wins,
        current_win_streak = excluded.current_win_streak,
        best_win_streak = excluded.best_win_streak,
        updated_at = excluded.updated_at
    `);

    this.statements.selectRound = this.db.prepare(`
      SELECT round_id
      FROM challenge_history
      WHERE round_id = ?
    `);

    this.statements.insertRound = this.db.prepare(`
      INSERT INTO challenge_history (
        round_id,
        room_id,
        challenge_id,
        challenge_title,
        challenge_type,
        challenge_difficulty,
        challenge_points,
        explanation,
        challenge_json,
        results_json,
        session_scores_json,
        finalized_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.statements.upsertRoomHistory = this.db.prepare(`
      INSERT INTO room_history (
        room_id,
        participants_json,
        total_rounds,
        last_round_id,
        last_challenge_title,
        updated_at
      ) VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(room_id) DO UPDATE SET
        participants_json = excluded.participants_json,
        total_rounds = room_history.total_rounds + 1,
        last_round_id = excluded.last_round_id,
        last_challenge_title = excluded.last_challenge_title,
        updated_at = excluded.updated_at
    `);

    this.statements.selectRecentRounds = this.db.prepare(`
      SELECT
        round_id,
        room_id,
        challenge_title,
        challenge_type,
        challenge_difficulty,
        challenge_points,
        explanation,
        results_json,
        finalized_at
      FROM challenge_history
      ORDER BY finalized_at DESC
      LIMIT ?
    `);
  }

  getLeaderboard(limit = 10) {
    if (!this.enabled) {
      return {
        enabled: false,
        backend: this.kind,
        error: this.error,
        entries: []
      };
    }

    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 10;
    const rows = this.statements.selectLeaderboard.all(safeLimit);
    const entries = rows.map((row) => ({
      identity: row.identity,
      totalPoints: row.total_points,
      totalChallengesAttempted: row.total_challenges_attempted,
      totalCorrectAnswers: row.total_correct_answers,
      totalWins: row.total_wins,
      currentWinStreak: row.current_win_streak,
      bestWinStreak: row.best_win_streak,
      updatedAt: row.updated_at
    }));

    return {
      enabled: true,
      backend: this.kind,
      databasePath: this.databasePath,
      entries
    };
  }

  getRecentRounds(limit = 12) {
    if (!this.enabled) {
      return {
        enabled: false,
        backend: this.kind,
        error: this.error,
        entries: []
      };
    }

    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 12;
    const rows = this.statements.selectRecentRounds.all(safeLimit);

    return {
      enabled: true,
      backend: this.kind,
      entries: rows.map((row) => ({
        roundId: row.round_id,
        roomId: row.room_id,
        challenge: {
          title: row.challenge_title,
          type: row.challenge_type,
          difficulty: row.challenge_difficulty,
          points: row.challenge_points
        },
        explanation: row.explanation,
        results: JSON.parse(row.results_json),
        finalizedAt: row.finalized_at
      }))
    };
  }

  applyRoundResult({ roomId, roundId, challenge, results, sessionScores }) {
    if (!this.enabled) {
      return {
        enabled: false,
        persisted: false,
        error: this.error
      };
    }

    const finalizedAt = Date.now();

    try {
      this.db.exec("BEGIN IMMEDIATE");

      const existingRound = this.statements.selectRound.get(roundId);

      if (existingRound) {
        this.db.exec("COMMIT");
        return {
          enabled: true,
          persisted: false,
          duplicate: true
        };
      }

      this.statements.insertRound.run(
        roundId,
        roomId,
        challenge.id || "",
        challenge.title || "",
        challenge.type || "",
        challenge.difficulty || "",
        challenge.points || 0,
        challenge.explanation || "",
        JSON.stringify(challenge),
        JSON.stringify(results),
        JSON.stringify(sessionScores || {}),
        finalizedAt
      );

      for (const result of results) {
        const previousRow = this.statements.selectPlayer.get(result.identity);
        const previous = previousRow
          ? {
              identity: previousRow.identity,
              totalPoints: previousRow.total_points,
              totalChallengesAttempted: previousRow.total_challenges_attempted,
              totalCorrectAnswers: previousRow.total_correct_answers,
              totalWins: previousRow.total_wins,
              currentWinStreak: previousRow.current_win_streak,
              bestWinStreak: previousRow.best_win_streak,
              updatedAt: previousRow.updated_at
            }
          : createDefaultStats(result.identity);
        const nextWinStreak = result.isWinner ? previous.currentWinStreak + 1 : 0;

        this.statements.upsertPlayer.run(
          result.identity,
          previous.totalPoints + (result.pointsAwarded || 0),
          previous.totalChallengesAttempted + 1,
          previous.totalCorrectAnswers + (result.correct ? 1 : 0),
          previous.totalWins + (result.isWinner ? 1 : 0),
          nextWinStreak,
          Math.max(previous.bestWinStreak, nextWinStreak),
          finalizedAt
        );
      }

      this.statements.upsertRoomHistory.run(
        roomId,
        JSON.stringify(results.map((item) => item.identity)),
        roundId,
        challenge.title || "",
        finalizedAt
      );

      this.db.exec("COMMIT");

      return {
        enabled: true,
        persisted: true
      };
    } catch (error) {
      try {
        this.db.exec("ROLLBACK");
      } catch (_rollbackError) {
      }

      return {
        enabled: false,
        persisted: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  SQLiteStore,
  createDefaultStats
};
