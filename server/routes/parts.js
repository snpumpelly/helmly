const express = require('express');
const db = require('../db');
const { getPartQuery } = require('../services/parts/getPartQuery');

const router = express.Router();

// GET /api/parts?category=starting_battery&boatId=<uuid>
router.get('/', async (req, res) => {
  const { category, boatId } = req.query;
  if (!category) return res.status(400).json({ error: 'category is required' });

  let boat = null;
  if (boatId) boat = db.boats.getById(boatId);

  // Fall back to client's most recent boat if boatId not found
  if (!boat) {
    const clientId = req.headers['x-client-id'];
    if (clientId && clientId !== 'anonymous') {
      const boats = db.boats.getByClient(clientId);
      if (boats.length) boat = boats[0];
    }
  }

  try {
    const result = await getPartQuery(boat || {}, category);
    res.json({
      amazon:     result.amazon,
      westmarine: result.westmarine,
      source:     result.source,
      amazonUrl:    `https://www.amazon.com/s?k=${encodeURIComponent(result.amazon)}&tag=stuartpumpell-20`,
      westmarineUrl: `https://www.westmarine.com/search?q=${encodeURIComponent(result.westmarine)}`,
    });
  } catch (err) {
    console.error('Parts route error:', err.message);
    res.status(500).json({ error: 'Parts lookup failed' });
  }
});

module.exports = router;
