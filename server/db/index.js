const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'helmly.db');
const db = new DatabaseSync(DB_PATH);

// Performance pragmas
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS boats (
    id          TEXT PRIMARY KEY,
    client_id   TEXT NOT NULL,
    make        TEXT,
    model       TEXT,
    year        TEXT,
    engine_type TEXT NOT NULL,
    engine_hp   TEXT,
    hull_length TEXT,
    hvac        TEXT,
    saltwater   INTEGER DEFAULT 1,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_boats_client ON boats(client_id);

  CREATE TABLE IF NOT EXISTS conversations (
    id           TEXT PRIMARY KEY,
    boat_id      TEXT,
    client_id    TEXT NOT NULL,
    messages     TEXT NOT NULL DEFAULT '[]',
    safety_class TEXT,
    outcome      TEXT,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_conv_boat   ON conversations(boat_id);
  CREATE INDEX IF NOT EXISTS idx_conv_client ON conversations(client_id);

  CREATE TABLE IF NOT EXISTS escalation_log (
    id                TEXT PRIMARY KEY,
    conversation_id   TEXT,
    boat_id           TEXT,
    client_id         TEXT,
    escalation_class  TEXT NOT NULL,
    severity          TEXT NOT NULL,
    layer             TEXT NOT NULL DEFAULT 'code',
    input_text        TEXT,
    app_version       TEXT DEFAULT '1.0.0',
    created_at        INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS onboarding_acks (
    id          TEXT PRIMARY KEY,
    client_id   TEXT NOT NULL,
    ack_type    TEXT NOT NULL,
    ack_version TEXT NOT NULL DEFAULT 'v1.0',
    created_at  INTEGER NOT NULL,
    UNIQUE(client_id, ack_type)
  );
`);

// ── Prepared statements ───────────────────────────────────────────────────────
const boatStmts = {
  upsert: db.prepare(`
    INSERT INTO boats (id, client_id, make, model, year, engine_type, engine_hp, hull_length, hvac, saltwater, created_at, updated_at)
    VALUES (@id, @client_id, @make, @model, @year, @engine_type, @engine_hp, @hull_length, @hvac, @saltwater, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      make=excluded.make, model=excluded.model, year=excluded.year,
      engine_type=excluded.engine_type, engine_hp=excluded.engine_hp,
      hull_length=excluded.hull_length, hvac=excluded.hvac,
      saltwater=excluded.saltwater, updated_at=excluded.updated_at
  `),
  getByClient: db.prepare(`SELECT * FROM boats WHERE client_id = ? ORDER BY updated_at DESC`),
  getById:     db.prepare(`SELECT * FROM boats WHERE id = ?`),
};

const convStmts = {
  create: db.prepare(`
    INSERT INTO conversations (id, boat_id, client_id, messages, safety_class, outcome, created_at, updated_at)
    VALUES (@id, @boat_id, @client_id, @messages, @safety_class, @outcome, @created_at, @updated_at)
  `),
  update: db.prepare(`
    UPDATE conversations SET messages=@messages, safety_class=@safety_class, outcome=@outcome, updated_at=@updated_at
    WHERE id=@id
  `),
  getById:     db.prepare(`SELECT * FROM conversations WHERE id = ?`),
  getByBoat:   db.prepare(`SELECT id, safety_class, outcome, created_at, updated_at FROM conversations WHERE boat_id = ? ORDER BY created_at DESC LIMIT 50`),
  getByClient: db.prepare(`SELECT id, boat_id, safety_class, outcome, created_at FROM conversations WHERE client_id = ? ORDER BY created_at DESC LIMIT 20`),
};

const escalationStmts = {
  insert: db.prepare(`
    INSERT INTO escalation_log (id, conversation_id, boat_id, client_id, escalation_class, severity, layer, input_text, app_version, created_at)
    VALUES (@id, @conversation_id, @boat_id, @client_id, @escalation_class, @severity, @layer, @input_text, @app_version, @created_at)
  `),
};

const onboardingStmts = {
  upsert: db.prepare(`
    INSERT INTO onboarding_acks (id, client_id, ack_type, ack_version, created_at)
    VALUES (@id, @client_id, @ack_type, @ack_version, @created_at)
    ON CONFLICT(client_id, ack_type) DO UPDATE SET ack_version=excluded.ack_version, created_at=excluded.created_at
  `),
  getByClient: db.prepare(`SELECT ack_type, ack_version, created_at FROM onboarding_acks WHERE client_id = ?`),
  check: db.prepare(`SELECT 1 FROM onboarding_acks WHERE client_id = ? AND ack_type = ? AND ack_version = ?`),
};

// ── Public API ────────────────────────────────────────────────────────────────
module.exports = {
  db,

  boats: {
    upsert:      (boat)     => boatStmts.upsert.run(boat),
    getByClient: (clientId) => boatStmts.getByClient.all(clientId),
    getById:     (id)       => boatStmts.getById.get(id),
  },

  conversations: {
    create: (conv) => convStmts.create.run({ ...conv, messages: JSON.stringify(conv.messages) }),
    update: (conv) => convStmts.update.run({ ...conv, messages: JSON.stringify(conv.messages) }),
    getById: (id) => {
      const row = convStmts.getById.get(id);
      if (!row) return null;
      return { ...row, messages: JSON.parse(row.messages) };
    },
    getByBoat:   (boatId)   => convStmts.getByBoat.all(boatId),
    getByClient: (clientId) => convStmts.getByClient.all(clientId),
  },

  escalations: {
    log: (entry) => escalationStmts.insert.run(entry),
  },

  onboarding: {
    acknowledge: (ack) => onboardingStmts.upsert.run(ack),
    getByClient: (clientId) => onboardingStmts.getByClient.all(clientId),
    isComplete:  (clientId) => {
      const required = [
        { type: 'safety',  version: 'v1.0' },
        { type: 'terms',   version: 'v1.0' },
        { type: 'privacy', version: 'v1.0' },
      ];
      return required.every(r => onboardingStmts.check.get(clientId, r.type, r.version));
    },
  },
};
