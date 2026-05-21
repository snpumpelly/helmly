# Helmly Server — Setup

## 1. Install dependencies
```
cd server
npm install
```

## 2. Add your API key
```
cp .env.example .env
```
Open `.env` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get a key at: https://console.anthropic.com

## 3. Start the server
```
npm run dev
```
Server runs on http://localhost:3001

## 4. Open the app
Open `index.html` in your browser (or use the preview panel).
The "Ask Helmly AI" button and all AI chat features will connect to the local server.

## Cost estimate (with prompt caching)
- ~$0.02–$0.04 per full diagnostic conversation
- 10,000 users × 2 conversations/mo ≈ $400–800/mo in API costs

## Production deployment
- Deploy `server/` to Railway, Render, or Fly.io
- Set `CORS_ORIGIN` in `.env` to your production frontend URL
- Replace in-memory conversation store with a database (Postgres + pgvector recommended)
