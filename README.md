# Phathu and Ray's Pyte Environment

This project runs as a full Node backend plus frontend app. The live shared room, chat, Socket.io sync, and session-based challenge scoring all come from the Express server in `server/index.js`.

## Local run

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm start`
3. Open:
   `http://localhost:3000`

## Backend deployment

GitHub Pages is not enough for the full app anymore because Socket.io still needs a running Node server.

### Recommended host: Railway

This repo now includes a `Dockerfile`, so Railway can build and run it directly from GitHub.

1. Create a new Railway project from this GitHub repo.
2. Deploy the service.
3. Use `/health` or `/api/health` for the service health check.

The server already respects Railway's `PORT` and serves the frontend together with the live room backend.

## Environment variables

- `PORT`
