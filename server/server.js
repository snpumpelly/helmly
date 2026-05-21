require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const { v4: uuidv4 } = require('uuid');

const { SYSTEM_PROMPT }     = require('./prompt');
const { retrieveKnowledge } = require('./knowledge');
const { classifyHardStop }  = require('./services/safety');
const db                    = require('./db');

const boatsRoute        = require('./routes/boats');
const conversationsRoute = require('./routes/conversations');
const onboardingRoute   = require('./routes/onboarding');
const partsRoute        = require('./routes/parts');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Anthropic client ──────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '4mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/boats',         boatsRoute);
app.use('/api/conversations', conversationsRoute);
app.use('/api/onboarding',    onboardingRoute);
app.use('/api/parts',         partsRoute);

// ── Format KB entries for context injection ───────────────────────────────────
function formatKBContext(entries) {
  if (!entries.length) return '';
  return [
    '\n\n<helmly_knowledge_base>',
    'Relevant entries from the Helmly diagnostic knowledge base:',
    ...entries.map((e, i) => [
      `\n[Entry ${i + 1}] System: ${e.system} | Symptom: ${e.symptom}`,
      `Likely causes: ${e.likely_causes.join('; ')}`,
      `Quick checks: ${e.checks.join('; ')}`,
      `Fix path: ${e.fix_path}`,
      `Escalate if: ${e.escalate_if}`,
    ].join('\n')),
    '</helmly_knowledge_base>'
  ].join('\n');
}

// ── Format boat profile for context injection ─────────────────────────────────
function formatBoatContext(boat) {
  if (!boat) return '';
  return `\n\n<boat_profile>
Make: ${boat.make || 'Unknown'} | Model: ${boat.model || 'Unknown'} | Year: ${boat.year || 'Unknown'}
Engine type: ${(boat.engine_type || 'unknown').replace(/_/g, ' ')} | HP: ${boat.engine_hp || 'unknown'}
Hull length: ${boat.hull_length || 'unknown'} ft | HVAC: ${boat.hvac || 'none specified'}
Water type: ${boat.saltwater ? 'saltwater' : 'freshwater'}
</boat_profile>`;
}

// ── Log an escalation to DB ───────────────────────────────────────────────────
function logEscalation({ conversationId, boatId, clientId, escalationClass, severity, layer, inputText }) {
  try {
    db.escalations.log({
      id: uuidv4(),
      conversation_id: conversationId || null,
      boat_id: boatId || null,
      client_id: clientId || null,
      escalation_class: escalationClass,
      severity,
      layer,
      input_text: inputText ? inputText.slice(0, 500) : null,
      app_version: '1.0.0',
      created_at: Date.now(),
    });
  } catch (err) {
    console.error('Failed to log escalation:', err.message);
  }
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const clientId = req.headers['x-client-id'] || 'anonymous';
  const { message, conversationId, boatId } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  // Load boat profile (required for correct safety classification)
  let boat = null;
  if (boatId) {
    boat = db.boats.getById(boatId);
  }
  // Fallback: get most recent boat for this client
  if (!boat && clientId !== 'anonymous') {
    const boats = db.boats.getByClient(clientId);
    if (boats.length) boat = boats[0];
  }

  // ── Layer 1: code-level hard-stop classifier (runs before LLM) ───────────
  const hardStop = classifyHardStop(message, boat || {});
  if (hardStop) {
    const convId = conversationId || uuidv4();
    logEscalation({
      conversationId: convId,
      boatId: boat?.id,
      clientId,
      escalationClass: hardStop.class,
      severity: hardStop.severity,
      layer: 'code',
      inputText: message,
    });

    // Persist the hard-stop turn to the conversation
    if (conversationId) {
      const conv = db.conversations.getById(conversationId);
      if (conv) {
        const messages = [
          ...conv.messages,
          { role: 'user', content: message },
          { role: 'assistant', content: hardStop.message }
        ];
        db.conversations.update({
          id: conversationId,
          messages,
          safety_class: hardStop.class,
          outcome: 'escalated',
          updated_at: Date.now(),
        });
      }
    }

    return res.json({
      conversationId: convId,
      reply: hardStop.message,
      hardStop: true,
      safetyClass: hardStop.class,
    });
  }

  // ── Load or create conversation ───────────────────────────────────────────
  let conv;
  const convId = conversationId || uuidv4();

  if (conversationId) {
    conv = db.conversations.getById(conversationId);
  }

  if (!conv) {
    const now = Date.now();
    conv = {
      id: convId,
      boat_id: boat?.id || null,
      client_id: clientId,
      messages: [],
      safety_class: null,
      outcome: null,
      created_at: now,
      updated_at: now,
    };
    db.conversations.create(conv);
  }

  // ── Retrieve relevant KB entries ──────────────────────────────────────────
  const allText = conv.messages.map(m => m.content).join(' ') + ' ' + message;
  const kbEntries = retrieveKnowledge(allText, null, 4);
  const kbContext = formatKBContext(kbEntries);
  const boatContext = formatBoatContext(boat);

  // ── Append user message ───────────────────────────────────────────────────
  conv.messages.push({ role: 'user', content: message });

  const recentMessages = conv.messages.slice(-12);

  try {
    // ── Claude API call with prompt caching ───────────────────────────────
    // Cached: system prompt + boat profile (stable within session)
    // Not cached: KB context (changes per turn)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT + boatContext,
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: kbContext,
        }
      ],
      messages: recentMessages,
    });

    const assistantReply = response.content[0].text;
    conv.messages.push({ role: 'assistant', content: assistantReply });

    // ── Detect safety class from reply (Layer 2 prompt-level) ────────────
    let safetyClass = 'convenience';
    let isPromptOnlyEscalation = false;

    if (/safety.critical|emergency|call.*coast guard|get off the boat|get into fresh air/i.test(assistantReply)) {
      safetyClass = 'safety-critical';
      isPromptOnlyEscalation = true;
    } else if (/mission.critical|cannot operate|shut down immediately|do not operate/i.test(assistantReply)) {
      safetyClass = 'mission-critical';
    }

    // Log prompt-only escalations separately so classifier can be improved
    if (isPromptOnlyEscalation) {
      logEscalation({
        conversationId: convId,
        boatId: boat?.id,
        clientId,
        escalationClass: 'prompt_only',
        severity: 'high',
        layer: 'prompt',
        inputText: message,
      });
    }

    // ── Detect outcome ────────────────────────────────────────────────────
    let outcome = conv.outcome;
    if (!outcome) {
      if (assistantReply.includes('<helmly_diagnosis>')) outcome = 'resolved';
      else if (isPromptOnlyEscalation) outcome = 'escalated';
    }

    // ── Persist conversation ──────────────────────────────────────────────
    db.conversations.update({
      id: convId,
      messages: conv.messages,
      safety_class: safetyClass,
      outcome: outcome || null,
      updated_at: Date.now(),
    });

    // ── Parse structured diagnosis block if present ───────────────────────
    let structuredDiagnosis = null;
    const diagMatch = assistantReply.match(/<helmly_diagnosis>([\s\S]*?)<\/helmly_diagnosis>/);
    if (diagMatch) {
      const diagXml = diagMatch[1];
      structuredDiagnosis = {
        likely_causes:      extractSection(diagXml, 'likely_causes'),
        quick_checks:       extractSection(diagXml, 'quick_checks'),
        fix_path:           extractSection(diagXml, 'fix_path'),
        escalation_trigger: extractSection(diagXml, 'escalation_trigger'),
      };
    }

    res.json({
      conversationId: convId,
      reply: assistantReply,
      structuredDiagnosis,
      safetyClass,
      hardStop: false,
      usage: {
        inputTokens:   response.usage?.input_tokens,
        outputTokens:  response.usage?.output_tokens,
        cacheCreation: response.usage?.cache_creation_input_tokens,
        cacheRead:     response.usage?.cache_read_input_tokens,
      },
    });

  } catch (err) {
    console.error('Claude API error:', err.message);
    if (err.status === 401) return res.status(500).json({ error: 'API key invalid — check your .env file.' });
    if (err.status === 429) return res.status(429).json({ error: 'AI service busy — please try again in a moment.' });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'claude-sonnet-4-6', uptime: Math.round(process.uptime()) + 's' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚓  Helmly server  →  http://localhost:${PORT}`);
  console.log(`    Model  : claude-sonnet-4-6 (prompt caching enabled)`);
  console.log(`    Safety : engine-type-aware hard-stop classifier active`);
  console.log(`    DB     : SQLite at server/db/helmly.db`);
  console.log(`    Parts  : catalog lookup + Haiku fallback\n`);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractSection(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : null;
}
