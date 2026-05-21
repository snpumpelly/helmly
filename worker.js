/**
 * Helmly Backend — Cloudflare Worker
 * ─────────────────────────────────────────────────────────────
 * DEPLOY STEPS:
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler deploy worker.js --name helmly-backend --compatibility-date 2024-01-01
 *   4. wrangler secret put ANTHROPIC_API_KEY   (paste your key when prompted)
 *   5. Copy your worker URL → update WORKER_URL in index.html
 *
 * SPEND CAP (do this BEFORE step 3):
 *   console.anthropic.com → Settings → Usage limits
 *   Monthly hard limit: $50  |  Daily alert: $5
 *   API key name: helmly-dev-worker
 *
 * ROUTES HANDLED:
 *   POST /api/chat                 — multi-turn AI diagnostic
 *   POST /api/boats                — save boat profile to Cache by clientId
 *   POST /api/onboarding/acknowledge — ack screen (stub, returns ok)
 *   OPTIONS *                      — CORS preflight
 *
 * CONVERSATION STORAGE:
 *   Uses Cloudflare Cache API (edge-persistent) so history and boat profiles
 *   survive across Worker instances. No KV/D1 setup required.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-client-id',
};

// Conversation TTL: 2 hours of inactivity clears the history
const CONV_TTL_SECONDS  = 7200;
// Boat profile TTL: 90 days (semi-permanent, updated when user edits boat)
const BOAT_TTL_SECONDS  = 7776000;

// ── Hard-stop classifier (server-side mirror of client-side check) ──
const HARD_STOP_PATTERNS = [
  /fuel.{0,20}leak|smell.{0,15}gas(oline)?|gas(oline)?.{0,15}smell|gas.{0,15}leak/i,
  /carbon.monoxide|co.{0,5}alarm|everyone.{0,20}(sick|ill|dizzy)|headache.{0,15}nausea/i,
  /fire.{0,10}(on|aboard|in).{0,5}boat|boat.{0,10}(is.on.)?fire|open.flame|on.fire/i,
  /sinking|taking.on.water|water.rising.fast|flooding.fast|hull.breach/i,
  /electrical.fire|burning.smell.{0,20}wir|arc.flash|sparking.{0,15}fire/i,
];

function isHardStop(text) {
  return HARD_STOP_PATTERNS.some(p => p.test(text));
}

// ── Cache API helpers ──────────────────────────────────────────────

async function cacheGet(key) {
  try {
    const res = await caches.default.match(new Request(`https://helmly-cache.internal/${key}`));
    return res ? await res.json() : null;
  } catch {
    return null;
  }
}

async function cachePut(key, data, ttl) {
  try {
    await caches.default.put(
      new Request(`https://helmly-cache.internal/${key}`),
      new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${ttl}`,
        },
      })
    );
  } catch {}
}

// ── Conversation history ───────────────────────────────────────────

async function getHistory(convId) {
  return (await cacheGet(`conv/${convId}`)) || [];
}

async function saveHistory(convId, history) {
  // Trim to last 40 messages before saving
  await cachePut(`conv/${convId}`, history.slice(-40), CONV_TTL_SECONDS);
}

// ── Boat profile ───────────────────────────────────────────────────

async function getBoatProfile(clientId) {
  if (!clientId) return null;
  return cacheGet(`boat/${clientId}`);
}

async function saveBoatProfile(clientId, boat) {
  if (!clientId) return;
  await cachePut(`boat/${clientId}`, boat, BOAT_TTL_SECONDS);
}

// ── System prompt ──────────────────────────────────────────────────
function buildSystemPrompt(boat, caps) {
  const boatDesc = boat
    ? [
        boat.year && boat.make ? `${boat.year} ${boat.make} ${boat.model || ''}`.trim() : null,
        boat.boatType          ? boat.boatType : null,
        boat.engineMake        ? `${boat.engineMake} ${boat.engineModel || ''}`.trim() : null,
        boat.engineType        ? engineTypeLabel(boat.engineType) : null,
        boat.engineHp          ? `${boat.engineHp}HP` : null,
        boat.saltwater         ? 'saltwater use' : 'freshwater use',
      ].filter(Boolean).join(', ')
    : null;

  const vesselLine = boatDesc
    ? `You are helping the owner of a ${boatDesc}.`
    : `The owner has not entered their boat information yet. If relevant, you may ask for engine type or make to give a more precise answer, but keep questions brief.`;

  // Build equipment context from capabilities
  const equipmentLines = [];
  if (caps) {
    if (caps.hasShorePower)        equipmentLines.push('shore power');
    if (caps.hasGenerator)         equipmentLines.push(`onboard generator${caps.generatorBrand ? ` (${caps.generatorBrand})` : ''}`);
    if (caps.hasHVAC)              equipmentLines.push('air conditioning / HVAC');
    if (caps.hasFreshwaterCooling) equipmentLines.push('closed cooling system (antifreeze)');
    if (caps.hasDualBattery)       equipmentLines.push('dual battery banks');
    if (caps.hasTrimTabs)          equipmentLines.push('trim tabs');
    if (caps.hasBilgeBlower)       equipmentLines.push('bilge blower');
    if (caps.hasFwPump)            equipmentLines.push('freshwater pressure pump');
    if (caps.hasRwPump)            equipmentLines.push('raw water / washdown pump');
    if (caps.hasWindlass)          equipmentLines.push(`electric windlass${caps.windlassBrand ? ` (${caps.windlassBrand})` : ''}`);
    if (caps.hasStereo)            equipmentLines.push(`marine stereo${caps.hasAmp ? ' with amplifier' : ''}`);
    if (caps.hasElectronics)       equipmentLines.push(`electronics / chartplotter${caps.electronicsBrand ? ` (${caps.electronicsBrand})` : ''}`);
    if (caps.steeringType && caps.steeringType !== 'not_sure') {
      const steerMap = { cable: 'cable steering', hydraulic: 'hydraulic steering', electric: 'electric/power-assisted steering' };
      equipmentLines.push(steerMap[caps.steeringType] || caps.steeringType);
    }
    if (caps.hasFuelInjection && caps.hasFuelInjection !== 'not_sure') {
      equipmentLines.push(caps.hasFuelInjection === 'fuel_injected' ? 'fuel-injected (EFI)' : 'carbureted');
    }
  }
  const equipmentLine = equipmentLines.length > 0
    ? `\n\nKNOWN EQUIPMENT: ${equipmentLines.join(', ')}. Do NOT ask about these — the owner has already confirmed they have them.`
    : '';

  return `You are Helmly, an expert marine mechanic assistant with 25+ years of hands-on experience diagnosing and repairing recreational boats. ${vesselLine}${equipmentLine}

RESPONSE STYLE:
- Be direct, practical, and conversational — like a trusted mechanic talking to a boat owner
- Use plain language. Avoid jargon unless you explain it
- Ask one focused follow-up question at a time when you need more information
- When giving a diagnosis or fix, be specific: what to check, where to find it, what to look for
- Always mention safety concerns first if relevant
- IMPORTANT: If you already know the boat's engine type, make, model, or any equipment from the context above, do NOT ask the user to provide it again. Use what you know.

RESPONSE FORMAT:
After your conversational response, if you have enough information to suggest a diagnosis or action steps, include a structured block:

<helmly_diagnosis>
{
  "likely_causes": ["cause 1", "cause 2"],
  "quick_checks": ["check 1", "check 2"],
  "fix_path": "Brief description of the most likely repair path",
  "escalation_trigger": "Describe the specific condition that means they should call a professional instead of continuing DIY"
}
</helmly_diagnosis>

HARD STOPS — if the user describes any of these, respond ONLY with emergency instructions:
- Active fuel leak or strong gas smell
- CO symptoms (headache, dizziness, nausea on board)
- Fire on board
- Rapidly taking on water / sinking
- Electrical fire or arcing

SCOPE:
- Diagnose and guide repairs for outboard, sterndrive (I/O), inboard gas, and inboard diesel engines
- Electrical systems, bilge, steering, AC/HVAC, generators, windlass, VHF, chartplotters
- Know when to escalate: head gasket, compression issues, full engine rebuilds, structural damage — always escalate these
- Do not fabricate part numbers. Give real guidance on what category of part is needed.`;
}

function engineTypeLabel(type) {
  const map = {
    outboard:       'outboard',
    sterndrive:     'sterndrive/I-O',
    inboard_gas:    'inboard gas',
    inboard_diesel: 'inboard diesel',
  };
  return map[type] || type;
}

// ── Main fetch handler ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url      = new URL(request.url);
    const clientId = request.headers.get('x-client-id') || null;

    // Onboarding ack — stub
    if (url.pathname === '/api/onboarding/acknowledge') {
      return json({ ok: true }, 200);
    }

    // Boat profile save — persist to Cache so /api/chat can use it
    if (url.pathname === '/api/boats' && request.method === 'POST') {
      if (clientId) {
        try {
          const body = await request.json();
          // Normalise field names to camelCase for consistent use in buildSystemPrompt
          const boat = {
            make:        body.make        || null,
            model:       body.model       || null,
            year:        body.year        || null,
            boatType:    body.boat_type   || body.boatType    || null,
            engineType:  body.engine_type || body.engineType  || null,
            engineMake:  body.engine_make || body.engineMake  || null,
            engineModel: body.engine_model|| body.engineModel || null,
            engineHp:    body.engine_hp   || body.engineHp    || null,
            hullLen:     body.hull_length || body.hullLen     || null,
            saltwater:   body.saltwater   ?? null,
            hvac:        body.hvac        || null,
          };
          await saveBoatProfile(clientId, boat);
        } catch {}
      }
      return json({ ok: true }, 200);
    }

    // Main chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env, clientId);
    }

    // Photo part identifier
    if (url.pathname === '/api/identify-part' && request.method === 'POST') {
      return handleIdentifyPart(request, env, clientId);
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  }
};

async function handleChat(request, env, clientId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { message, conversationId, boatId, boat: bodyBoat, capabilities: bodyCapabilities, history: clientHistory } = body;

  if (!message || typeof message !== 'string') {
    return json({ error: 'message is required' }, 400);
  }

  // Server-side hard-stop check (mirrors client-side classifier)
  if (isHardStop(message)) {
    return json({
      reply: '🚨 This sounds like an emergency. Stop what you\'re doing and call for help immediately:\n\n📞 Sea Tow: 1-800-4-SEATOW\n📡 TowBoatUS: 1-800-391-4869\n🆘 Coast Guard: VHF Channel 16 or call 911\n\nDo not stay below deck or continue troubleshooting.',
      structuredDiagnosis: null,
      conversationId: conversationId || crypto.randomUUID(),
    }, 200);
  }

  const convId = conversationId || crypto.randomUUID();

  // ── Resolve boat profile ─────────────────────────────────────────
  // Priority: 1) sent in request body (future), 2) cached from /api/boats call, 3) null
  const boat = bodyBoat || (await getBoatProfile(clientId)) || null;

  // ── Resolve conversation history ─────────────────────────────────
  // Priority: 1) sent by client (full history), 2) cached on server, 3) empty (first message)
  let history;
  if (Array.isArray(clientHistory) && clientHistory.length > 0) {
    history = clientHistory
      .filter(m => m.role && m.content)
      .map(m => ({ role: m.role, content: String(m.content) }));
  } else {
    history = await getHistory(convId);
  }

  // Append the new user message
  history.push({ role: 'user', content: message });

  // Resolve capabilities — sent directly by client
  const caps = bodyCapabilities || null;

  // Build Anthropic API request with prompt caching on the system prompt
  const systemPrompt = buildSystemPrompt(boat, caps);

  const anthropicBody = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      }
    ],
    messages: history.slice(-20),
  };

  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':          env.ANTHROPIC_API_KEY,
        'anthropic-version':  '2023-06-01',
        'anthropic-beta':     'prompt-caching-2024-07-31',
        'content-type':       'application/json',
      },
      body: JSON.stringify(anthropicBody),
    });
  } catch (err) {
    return json({ error: 'Failed to reach Anthropic API: ' + err.message }, 502);
  }

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text();
    return json({ error: `Anthropic error ${anthropicRes.status}: ${errBody}` }, 502);
  }

  const data = await anthropicRes.json();
  const replyText = data.content?.[0]?.text || '';

  // Persist updated history
  history.push({ role: 'assistant', content: replyText });
  await saveHistory(convId, history);

  // Parse and strip structured diagnosis block
  let structuredDiagnosis = null;
  const diagMatch = replyText.match(/<helmly_diagnosis>([\s\S]*?)<\/helmly_diagnosis>/);
  if (diagMatch) {
    try { structuredDiagnosis = JSON.parse(diagMatch[1].trim()); } catch {}
  }
  const cleanReply = replyText.replace(/<helmly_diagnosis>[\s\S]*?<\/helmly_diagnosis>/, '').trim();

  return json({
    reply: cleanReply,
    structuredDiagnosis,
    conversationId: convId,
    usage: data.usage,
  }, 200);
}

// ── Photo Part Identifier ──────────────────────────────────────
async function handleIdentifyPart(request, env, clientId) {
  let body;
  try { body = await request.json(); } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { imageBase64, mediaType, boat } = body;
  if (!imageBase64 || !mediaType) {
    return json({ error: 'imageBase64 and mediaType are required' }, 400);
  }

  // Build boat context for the system prompt
  const boatCtx = boat
    ? [
        boat.year && boat.make ? `${boat.year} ${boat.make} ${boat.model || ''}`.trim() : null,
        boat.boatType          ? boat.boatType : null,
        boat.engineMake        ? `${boat.engineMake} ${boat.engineModel || ''}`.trim() : null,
        boat.engineType        ? boat.engineType : null,
      ].filter(Boolean).join(', ')
    : null;

  const systemPrompt = `You are Helmly, an expert marine mechanic with 25+ years of experience. You are identifying a boat part from a photo.

${boatCtx ? `The boat is: ${boatCtx}.` : 'No boat information provided.'}

Respond ONLY with valid JSON in this exact shape — no markdown, no code fences, just raw JSON:
{
  "part_name": "Short official name of the part",
  "confidence": "high" | "medium" | "low",
  "what_it_does": "One or two sentences explaining the part's function on a boat",
  "common_failures": ["failure symptom 1", "failure symptom 2", "failure symptom 3"],
  "search_terms": ["search term 1", "search term 2"],
  "related_tree": null or one of these exact strings: "engine_overheat","no_start","engine_alarm","bilge_pump","marine_ac","electrical","nav_lights","generator","steering","tilt_trim","radio_no_power","speakers_no_sound","wont_shift","exhaust_smoke","vibration","fw_pump_cycling","head_flush","livewell","fridge_not_cooling","vhf_radio","chartplotter","windlass_fault","outlet_dead",
  "notes": "Optional extra tip for the owner, or null"
}

If you cannot identify the image as a marine part, set part_name to "Unknown part" and confidence to "low".`;

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            { type: 'text', text: 'What marine part is this? Respond with JSON only.' },
          ],
        }],
      }),
    });
  } catch (err) {
    return json({ error: 'Failed to reach Anthropic: ' + err.message }, 502);
  }

  if (!res.ok) {
    const errBody = await res.text();
    return json({ error: `Anthropic error ${res.status}: ${errBody}` }, 502);
  }

  const data = await res.json();
  const rawText = data.content?.[0]?.text || '{}';

  let result;
  try {
    // Strip any accidental markdown fences
    const clean = rawText.replace(/^```json?\n?/, '').replace(/```$/, '').trim();
    result = JSON.parse(clean);
  } catch {
    result = { part_name: 'Unknown part', confidence: 'low', what_it_does: rawText, common_failures: [], search_terms: [], related_tree: null, notes: null };
  }

  return json({ result, usage: data.usage }, 200);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
