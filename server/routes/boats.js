const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET /api/boats — get all boats for a client
router.get('/', (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(400).json({ error: 'x-client-id header required' });
  res.json(db.boats.getByClient(clientId));
});

// GET /api/boats/:id
router.get('/:id', (req, res) => {
  const boat = db.boats.getById(req.params.id);
  if (!boat) return res.status(404).json({ error: 'Not found' });
  res.json(boat);
});

// POST /api/boats — create or update boat profile
router.post('/', (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(400).json({ error: 'x-client-id header required' });

  const { id, make, model, year, engine_type, engine_hp, hull_length, hvac, saltwater } = req.body;

  if (!engine_type) {
    return res.status(400).json({ error: 'engine_type is required' });
  }

  const validEngineTypes = ['outboard', 'sterndrive', 'inboard_gas', 'inboard_diesel'];
  if (!validEngineTypes.includes(engine_type)) {
    return res.status(400).json({ error: `engine_type must be one of: ${validEngineTypes.join(', ')}` });
  }

  const now = Date.now();
  const boatId = id || uuidv4();

  db.boats.upsert({
    id: boatId,
    client_id: clientId,
    make: make || null,
    model: model || null,
    year: year || null,
    engine_type,
    engine_hp: engine_hp || null,
    hull_length: hull_length || null,
    hvac: hvac || null,
    saltwater: saltwater !== false ? 1 : 0,
    created_at: now,
    updated_at: now,
  });

  res.json(db.boats.getById(boatId));
});

module.exports = router;
