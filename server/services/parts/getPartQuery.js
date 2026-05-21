/**
 * getPartQuery — hybrid parts recommendation helper.
 * 1. Try the hand-curated lookup catalog first (fast, deterministic, high-conversion)
 * 2. Fall back to Claude Haiku for long-tail parts not in the catalog
 *
 * Returns { amazon: string, westmarine: string } ready for AFF.amazon() / AFF.westmarine()
 */

const Anthropic = require('@anthropic-ai/sdk');
const { lookup } = require('./catalog');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * @param {object} boat - boat profile from DB
 * @param {string} category - part category key (e.g. 'starting_battery', 'raw_water_impeller')
 * @param {string} [context] - optional: diagnostic context sentence to help Haiku be specific
 * @returns {Promise<{ amazon: string, westmarine: string, source: 'catalog'|'llm'|'generic' }>}
 */
async function getPartQuery(boat, category, context = '') {
  // ── 1. Try catalog lookup ──────────────────────────────────────────────────
  const catalogResult = lookup(category, boat);
  if (catalogResult) {
    return { ...catalogResult, source: 'catalog' };
  }

  // ── 2. Fall back to Haiku for long-tail ───────────────────────────────────
  const boatDesc = formatBoatDesc(boat);
  const prompt = `You are a marine parts specialist. Generate a specific Amazon search query and a West Marine search query for the following part request.

Boat: ${boatDesc}
Part needed: ${category.replace(/_/g, ' ')}
${context ? `Diagnostic context: ${context}` : ''}

Rules:
- Be as specific as possible — include brand names, model compatibility, or part numbers if known
- Do NOT include affiliate tag parameters
- Return ONLY valid JSON in this exact format, nothing else:
{"amazon":"<search query>","westmarine":"<search query>"}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text.trim();
    const parsed = JSON.parse(text);
    if (parsed.amazon && parsed.westmarine) {
      return { amazon: parsed.amazon, westmarine: parsed.westmarine, source: 'llm' };
    }
  } catch (err) {
    console.warn(`getPartQuery LLM fallback failed for "${category}":`, err.message);
  }

  // ── 3. Last resort: generic query ─────────────────────────────────────────
  const generic = category.replace(/_/g, ' ') + ' marine boat';
  return { amazon: generic, westmarine: generic, source: 'generic' };
}

function formatBoatDesc(boat) {
  if (!boat) return 'unknown boat';
  const parts = [
    boat.year,
    boat.make,
    boat.model,
    boat.engine_type ? `(${boat.engine_type.replace(/_/g, ' ')})` : '',
    boat.engine_hp ? `${boat.engine_hp}HP` : '',
    boat.hull_length ? `${boat.hull_length}ft` : '',
    boat.saltwater ? 'saltwater' : 'freshwater',
  ].filter(Boolean);
  return parts.join(' ') || 'unknown boat';
}

module.exports = { getPartQuery };
