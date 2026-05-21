const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/conversations — all conversations for a client
router.get('/', (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(400).json({ error: 'x-client-id header required' });
  res.json(db.conversations.getByClient(clientId));
});

// GET /api/conversations/boat/:boatId — all conversations for a boat
router.get('/boat/:boatId', (req, res) => {
  res.json(db.conversations.getByBoat(req.params.boatId));
});

// GET /api/conversations/:id — full conversation with messages
router.get('/:id', (req, res) => {
  const conv = db.conversations.getById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  res.json(conv);
});

module.exports = router;
