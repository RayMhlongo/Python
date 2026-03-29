# Phathu and Ray's Pyte Environment

This project now runs as a full Node backend plus frontend app. The live shared room, chat, Socket.io sync, and SQLite leaderboard all come from the Express server in `server/index.js`.

## Local run

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm start`
3. Open:
   `http://localhost:3000`

## Backend deployment

GitHub Pages is not enough for the full app anymore because Socket.io and SQLite need a running Node server.

### Recommended host: Railway

This repo now includes a `Dockerfile`, so Railway can build and run it directly from GitHub.

1. Create a new Railway project from this GitHub repo.
2. Add a volume and mount it at `/data`.
3. Set:
   `SQLITE_PATH=/data/pyte-room.sqlite`
4. Deploy the service.
5. Use `/health` or `/api/health` for the service health check.

The server already respects Railway's `PORT`, serves the frontend, and keeps the SQLite file on the mounted disk.

## Environment variables

- `PORT`
- `SQLITE_PATH`
- `RAILWAY_VOLUME_MOUNT_PATH` optional if you prefer Railway to supply the mount path through an env var
