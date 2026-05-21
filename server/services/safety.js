/**
 * Helmly hard-stop classifier — runs on every user input BEFORE the LLM is called.
 * Engine-type-aware per the Safety & Disclaimers Addendum.
 * Two-layer enforcement: this code layer + system prompt backup.
 */

// ── Engine type enum ──────────────────────────────────────────────────────────
const ENGINE_TYPES = {
  OUTBOARD:      'outboard',
  STERNDRIVE:    'sterndrive',
  INBOARD_GAS:   'inboard_gas',
  INBOARD_DIESEL:'inboard_diesel',
};

// ── Hard-stop messages keyed by escalation class ──────────────────────────────
const HARD_STOP_MESSAGES = {

  fuel_inboard: `⚠️ **Stop. Do not continue.**

With an inboard or sterndrive gasoline engine, fuel vapors sink into the bilge and can be ignited by a starter motor, bilge pump, or even static electricity.

**Right now:**
1. Get everyone off the boat immediately
2. Do not start the engine
3. Do not run the bilge blower without first ventilating with hatches open
4. Do not operate any electrical switch
5. Open all hatches to ventilate, then leave the vessel

📞 **Call for help:**
- **Marina or marine service** if you are at the dock
- **Sea Tow:** 1-800-4-SEATOW or VHF Channel 16
- **US Coast Guard** (active emergency): VHF Channel 16 or dial *CG

*Helmly assists. You decide. When in doubt, call a pro.*`,

  fuel_diesel_inboard: `⚠️ **Stop. Do not continue running the engine.**

A diesel fuel leak in an enclosed engine compartment is a fire hazard near hot exhaust and engine components, and a serious slip hazard.

**Right now:**
1. Shut down the engine
2. Contain the leak if it is safe to do so (rag, absorbent pad)
3. Do not continue underway — head to the dock or anchor
4. Call a marine service to inspect and repair before operating again

📞 **Sea Tow:** 1-800-4-SEATOW | VHF Channel 16

*Helmly assists. You decide. When in doubt, call a pro.*`,

  fuel_outboard: `⚠️ **Stop. Clean up any fuel spill before continuing.**

Do not start the engine or operate any electrical switch near pooled or spilled fuel.

Once the fuel is cleaned up and there is no smell of fuel near the engine, it is safe to continue diagnosing.

If you are seeing an active fuel leak from the fuel line or tank (not just a primer bulb issue), call a marine service.

📞 **Sea Tow:** 1-800-4-SEATOW | VHF Channel 16

*Helmly assists. You decide. When in doubt, call a pro.*`,

  co_suspected: `🆘 **Possible carbon monoxide. Get into fresh air NOW.**

Carbon monoxide is colorless and odorless. The symptoms you are describing — headache, dizziness, nausea, confusion, or feeling unwell near a running engine or generator — are warning signs.

**Right now:**
1. Get everyone off the boat and into fresh air immediately
2. Open all hatches and doors
3. If anyone feels worse or loses consciousness: dial **911**
4. On the water: **VHF Channel 16** for Coast Guard

Do not go back aboard until the source is found and fixed by a professional.

📞 **US Coast Guard:** VHF Channel 16 | **Emergency:** 911

*Helmly assists. You decide. When in doubt, call a pro.*`,

  fire_risk: `🔥 **Stop. Fire or smoke is an emergency.**

**Right now:**
1. Grab a fire extinguisher (Type B:C for engine/electrical fires)
2. Do NOT open a compartment that may be on fire — this feeds it oxygen
3. If flames are visible and growing: prepare to abandon the vessel
4. Shut off the main battery switch if safely reachable — this removes power from electrical sources
5. Call the Coast Guard: **VHF Channel 16**

If smoke or burning smell only (no visible flames): ventilate, find the source, do not restart the engine.

📞 **US Coast Guard:** VHF Channel 16 | **Emergency:** 911

*Helmly assists. You decide. When in doubt, call a pro.*`,

  electrical_hazard: `⚡ **Stop. Do not reset that breaker again.**

A breaker that trips immediately every time is protecting you from a short circuit or major overload. Forcing it on risks an electrical fire.

**Right now:**
1. Leave the breaker in the OFF position
2. Disconnect all devices on that circuit
3. If you see melted insulation, smell burning, or feel heat on wires: shut off the main battery switch
4. Call a marine electrician — do not operate the circuit until inspected

For AC shore power issues beyond a single breaker reset: disconnect shore power and call a licensed electrician.

📞 **Sea Tow:** 1-800-4-SEATOW | VHF Channel 16

*Helmly assists. You decide. When in doubt, call a pro.*`,

  below_waterline: `🚨 **Flooding risk. Act now.**

**Right now:**
1. Confirm the bilge pump is running and keeping up with inflow
2. If you cannot stop the water: call for tow service or the Coast Guard immediately
3. Do not attempt to repair a through-hull, seacock, or below-waterline hose failure while the boat is in the water without professional help

If the bilge pump cannot keep up or you are taking on water rapidly:

📞 **US Coast Guard:** VHF Channel 16 | **Sea Tow:** 1-800-4-SEATOW

*Helmly assists. You decide. When in doubt, call a pro.*`,

  bilge_critical: `🚨 **Active flooding risk. Check the bilge now.**

Open the bilge access and look:
- **Standing water + pump not running** → you have a flooding situation. Call for tow service immediately.
- **Pump running constantly** → you have an active leak. Find the source while heading toward the dock.

Do not ignore a constantly-running bilge pump. It is not normal.

📞 **Sea Tow:** 1-800-4-SEATOW | **Coast Guard:** VHF Channel 16

*Helmly assists. You decide. When in doubt, call a pro.*`,
};

// ── Classifier ────────────────────────────────────────────────────────────────
/**
 * @param {string} input - raw user message
 * @param {object} boatProfile - { engineType, ... }
 * @returns {{ class: string, severity: string, message: string } | null}
 */
function classifyHardStop(input, boatProfile = {}) {
  const lower = input.toLowerCase();
  const engineType = boatProfile.engineType || boatProfile.engine_type || null;

  // ── 1. CO — highest severity, symptom-based, always fires regardless of engine ──
  if (containsAny(lower, [
    'co alarm', 'carbon monoxide', 'co detector',
    'headache', 'dizzy', 'dizziness', 'nausea', 'nauseated',
    'feel off', 'feel unwell', 'feeling off', 'feeling unwell',
    'confused', 'confusion', 'lightheaded', 'light headed',
    'sick on the boat', 'everyone feels', 'kids are sick',
  ])) {
    // Only fire CO stop if there's contextual reason (engine/generator running context)
    // or if CO/alarm words are explicit
    const explicitCO = containsAny(lower, ['co alarm', 'carbon monoxide', 'co detector']);
    const symptomWords = containsAny(lower, [
      'headache', 'dizzy', 'dizziness', 'nausea', 'nauseated',
      'feel off', 'feel unwell', 'feeling off', 'feeling unwell',
      'confused', 'lightheaded',
    ]);
    if (explicitCO || symptomWords) {
      return { class: 'co_suspected', severity: 'high', message: HARD_STOP_MESSAGES.co_suspected };
    }
  }

  // ── 2. Fuel — engine-type-aware ───────────────────────────────────────────
  const fuelTrigger = containsAny(lower, [
    'fuel smell', 'smell fuel', 'smell gas', 'gas smell', 'smell gasoline',
    'fuel leak', 'leaking fuel', 'fuel leaking', 'fuel line leak',
    'fuel spill', 'spilled fuel', 'fuel pooling', 'pooling fuel',
    'diesel leak', 'diesel smell', 'diesel spill',
    'fuel in bilge', 'gas in bilge',
  ]);

  if (fuelTrigger) {
    if (engineType === ENGINE_TYPES.INBOARD_GAS || engineType === ENGINE_TYPES.STERNDRIVE) {
      return { class: 'fuel_inboard', severity: 'high', message: HARD_STOP_MESSAGES.fuel_inboard };
    }
    if (engineType === ENGINE_TYPES.INBOARD_DIESEL) {
      return { class: 'fuel_diesel_inboard', severity: 'high', message: HARD_STOP_MESSAGES.fuel_diesel_inboard };
    }
    // Outboard or unknown engine type
    return { class: 'fuel_outboard', severity: 'medium', message: HARD_STOP_MESSAGES.fuel_outboard };
  }

  // ── 3. Fire / smoke / heat ────────────────────────────────────────────────
  if (containsAny(lower, [
    'smoke', 'smoking', 'on fire', 'flames', 'fire in',
    'burning smell', 'smell burning', 'smells like burning',
    'melted wire', 'melted insulation', 'burned wire', 'hot wire',
    'electrical fire', 'sparks flying', 'arc flash',
  ])) {
    return { class: 'fire_risk', severity: 'high', message: HARD_STOP_MESSAGES.fire_risk };
  }

  // ── 4. Electrical hazard ──────────────────────────────────────────────────
  if (containsAny(lower, [
    'breaker keeps tripping', 'trips every time', 'trips immediately',
    'keeps blowing', 'trips again', 'tripped again',
    'electric shock', 'got shocked', 'shocked me', 'shocked by',
    'sparking', 'sparks from', 'sparks when',
    'melted insulation', 'burned insulation',
  ])) {
    return { class: 'electrical_hazard', severity: 'high', message: HARD_STOP_MESSAGES.electrical_hazard };
  }

  // ── 5. Below waterline ────────────────────────────────────────────────────
  if (containsAny(lower, [
    'through hull', 'thru hull', 'through-hull',
    'seacock fail', 'seacock broken', 'seacock cracked', 'seacock stuck',
    'hose blew off', 'hose came off', 'hose below waterline',
    'water coming in', 'water pouring in', 'taking on water',
    'flooding', 'sinking', 'hull breach',
  ])) {
    return { class: 'below_waterline', severity: 'high', message: HARD_STOP_MESSAGES.below_waterline };
  }

  // ── 6. Bilge pump failure while afloat ────────────────────────────────────
  if (containsAny(lower, [
    'bilge pump not working', 'bilge pump stopped', 'bilge pump failed',
    'bilge pump won\'t turn on', 'bilge pump not running',
    'bilge pump running constantly', 'bilge pump won\'t stop',
    'water in bilge', 'bilge is full', 'bilge filling',
  ])) {
    return { class: 'bilge_critical', severity: 'high', message: HARD_STOP_MESSAGES.bilge_critical };
  }

  return null; // no hard stop detected
}

// ── Helper ────────────────────────────────────────────────────────────────────
function containsAny(text, phrases) {
  return phrases.some(p => text.includes(p));
}

module.exports = { classifyHardStop, ENGINE_TYPES, HARD_STOP_MESSAGES };
