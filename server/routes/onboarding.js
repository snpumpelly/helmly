const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const VALID_TYPES    = ['safety', 'terms', 'privacy'];
const CURRENT_VERSION = 'v1.0';

// GET /api/onboarding/status — check completion for a client
router.get('/status', (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(400).json({ error: 'x-client-id header required' });

  const acks = db.onboarding.getByClient(clientId);
  const complete = db.onboarding.isComplete(clientId);

  res.json({
    complete,
    acks: acks.reduce((acc, a) => { acc[a.ack_type] = { version: a.ack_version, at: a.created_at }; return acc; }, {}),
    currentVersion: CURRENT_VERSION,
  });
});

// POST /api/onboarding/acknowledge — record a single acknowledgment
router.post('/acknowledge', (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(400).json({ error: 'x-client-id header required' });

  const { ack_type, ack_version } = req.body;

  if (!VALID_TYPES.includes(ack_type)) {
    return res.status(400).json({ error: `ack_type must be one of: ${VALID_TYPES.join(', ')}` });
  }

  db.onboarding.acknowledge({
    id: uuidv4(),
    client_id: clientId,
    ack_type,
    ack_version: ack_version || CURRENT_VERSION,
    created_at: Date.now(),
  });

  const complete = db.onboarding.isComplete(clientId);
  res.json({ ok: true, complete });
});

module.exports = router;
