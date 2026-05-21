/**
 * Helmly parts lookup catalog — hand-curated, boat-profile-aware.
 * Each entry maps a part category + engine/hull filters → specific search queries.
 * Checked first by getPartQuery(); LLM fallback used when no entry matches.
 */

const CATALOG = [

  // ── BATTERIES ──────────────────────────────────────────────────────────────
  {
    category: 'starting_battery',
    engineType: ['outboard'],
    hullClass: ['small'],   // < 22ft
    amazon: 'marine starting battery group 24 outboard',
    westmarine: 'group 24 marine starting battery',
  },
  {
    category: 'starting_battery',
    engineType: ['outboard'],
    hullClass: ['mid', 'large'],
    amazon: 'marine starting battery group 27 high CCA',
    westmarine: 'group 27 marine starting battery',
  },
  {
    category: 'starting_battery',
    engineType: ['inboard_gas', 'sterndrive'],
    hullClass: ['small', 'mid'],
    amazon: 'marine starting battery group 27 650 CCA inboard',
    westmarine: 'group 27 marine starting battery inboard',
  },
  {
    category: 'starting_battery',
    engineType: ['inboard_gas', 'sterndrive'],
    hullClass: ['large'],
    amazon: 'marine starting battery group 31 800 CCA',
    westmarine: 'group 31 marine starting battery',
  },
  {
    category: 'starting_battery',
    engineType: ['inboard_diesel'],
    hullClass: null, // any
    amazon: 'marine diesel starting battery group 31 AGM 1000 CCA',
    westmarine: 'diesel marine starting battery AGM group 31',
  },
  {
    category: 'house_battery',
    engineType: null,
    hullClass: ['small'],
    amazon: 'marine AGM deep cycle battery group 24',
    westmarine: 'marine deep cycle battery group 24 AGM',
  },
  {
    category: 'house_battery',
    engineType: null,
    hullClass: ['mid', 'large'],
    amazon: 'marine AGM deep cycle battery group 31 100Ah',
    westmarine: 'marine AGM deep cycle battery group 31',
  },

  // ── IMPELLERS ──────────────────────────────────────────────────────────────
  {
    category: 'raw_water_impeller',
    engineType: ['outboard'],
    hpRange: [0, 60],
    amazon: 'outboard water pump impeller kit small 50HP',
    westmarine: 'outboard impeller kit 50HP',
  },
  {
    category: 'raw_water_impeller',
    engineType: ['outboard'],
    hpRange: [61, 150],
    amazon: 'outboard water pump impeller kit 90HP 115HP Johnson Evinrude',
    westmarine: 'outboard impeller kit 90-115HP',
  },
  {
    category: 'raw_water_impeller',
    engineType: ['outboard'],
    hpRange: [151, 999],
    amazon: 'outboard water pump impeller kit 150HP 200HP 225HP',
    westmarine: 'outboard impeller kit 150HP plus',
  },
  {
    category: 'raw_water_impeller',
    engineType: ['inboard_gas', 'sterndrive'],
    hullClass: null,
    amazon: 'MerCruiser raw water pump impeller kit 46-807151A14',
    westmarine: 'MerCruiser raw water pump impeller',
  },
  {
    category: 'raw_water_impeller',
    engineType: ['inboard_diesel'],
    hullClass: null,
    amazon: 'marine diesel raw water pump impeller Yanmar Volvo',
    westmarine: 'diesel raw water pump impeller',
  },
  {
    category: 'ac_impeller',
    engineType: null,
    hullClass: null,
    amazon: 'Jabsco raw water pump impeller marine AC 17937',
    westmarine: 'Jabsco impeller marine AC pump',
  },

  // ── SPARK PLUGS ────────────────────────────────────────────────────────────
  {
    category: 'spark_plugs',
    engineType: ['outboard'],
    hpRange: [0, 60],
    amazon: 'NGK BPZ8H-N-10 outboard spark plug small engine',
    westmarine: 'NGK outboard spark plugs small',
  },
  {
    category: 'spark_plugs',
    engineType: ['outboard'],
    hpRange: [61, 999],
    amazon: 'NGK BUHW-2 outboard spark plug large outboard',
    westmarine: 'NGK outboard spark plugs large',
  },
  {
    category: 'spark_plugs',
    engineType: ['inboard_gas', 'sterndrive'],
    hullClass: null,
    amazon: 'ACDelco R44LTS MerCruiser inboard spark plug set',
    westmarine: 'MerCruiser spark plug set inboard',
  },

  // ── FUEL FILTERS ───────────────────────────────────────────────────────────
  {
    category: 'fuel_filter',
    engineType: ['outboard'],
    hullClass: null,
    amazon: 'inline fuel filter 5/16 inch outboard marine',
    westmarine: 'outboard fuel filter inline',
  },
  {
    category: 'fuel_filter',
    engineType: ['inboard_gas', 'sterndrive', 'inboard_diesel'],
    hullClass: null,
    amazon: 'Racor 500 fuel water separator filter element marine',
    westmarine: 'Racor 500 fuel filter element',
  },
  {
    category: 'fuel_water_separator',
    engineType: null,
    hullClass: null,
    amazon: 'Racor 500FG fuel water separator assembly marine',
    westmarine: 'Racor 500 fuel water separator',
  },

  // ── PRIMER BULBS ───────────────────────────────────────────────────────────
  {
    category: 'primer_bulb',
    engineType: ['outboard'],
    hullClass: null,
    amazon: 'marine fuel line primer bulb assembly 5/16 outboard',
    westmarine: 'outboard fuel primer bulb',
  },

  // ── ANODES / ZINCS ─────────────────────────────────────────────────────────
  {
    category: 'anode_zinc',
    engineType: ['outboard'],
    hullClass: null,
    saltwater: true,
    amazon: 'outboard zinc anode kit saltwater marine',
    westmarine: 'outboard zinc anode kit',
  },
  {
    category: 'anode_magnesium',
    engineType: ['outboard'],
    hullClass: null,
    saltwater: false,
    amazon: 'outboard magnesium anode kit freshwater',
    westmarine: 'outboard magnesium anode freshwater',
  },
  {
    category: 'anode_zinc',
    engineType: ['inboard_gas', 'sterndrive'],
    hullClass: null,
    saltwater: true,
    amazon: 'sterndrive zinc anode kit MerCruiser Volvo saltwater',
    westmarine: 'sterndrive zinc anode set',
  },
  {
    category: 'shaft_zinc',
    engineType: null,
    hullClass: null,
    saltwater: true,
    amazon: 'propeller shaft zinc anode marine 1 inch',
    westmarine: 'shaft zinc anode marine',
  },

  // ── BILGE PUMPS ────────────────────────────────────────────────────────────
  {
    category: 'bilge_pump',
    engineType: null,
    hullClass: ['small'],
    amazon: 'Rule 800 GPH bilge pump automatic',
    westmarine: 'Rule bilge pump 800 GPH',
  },
  {
    category: 'bilge_pump',
    engineType: null,
    hullClass: ['mid'],
    amazon: 'Rule 1500 GPH bilge pump automatic',
    westmarine: 'Rule bilge pump 1500 GPH',
  },
  {
    category: 'bilge_pump',
    engineType: null,
    hullClass: ['large'],
    amazon: 'Rule 3700 GPH bilge pump high capacity',
    westmarine: 'Rule bilge pump 3700 GPH',
  },

  // ── BATTERY CHARGERS ───────────────────────────────────────────────────────
  {
    category: 'battery_charger',
    engineType: null,
    hullClass: ['small'],
    amazon: 'marine battery charger 10 amp single bank',
    westmarine: 'marine battery charger 10A',
  },
  {
    category: 'battery_charger',
    engineType: null,
    hullClass: ['mid', 'large'],
    amazon: 'ProMariner marine battery charger 20 amp dual bank',
    westmarine: 'ProMariner battery charger dual bank',
  },

  // ── STEERING ───────────────────────────────────────────────────────────────
  {
    category: 'hydraulic_steering_fluid',
    engineType: null,
    hullClass: null,
    amazon: 'SeaStar hydraulic steering fluid HA5430H marine',
    westmarine: 'SeaStar hydraulic steering fluid',
  },
  {
    category: 'steering_cable',
    engineType: ['outboard'],
    hullClass: ['small'],
    amazon: 'Teleflex Safe-T outboard steering cable 10ft',
    westmarine: 'outboard steering cable Teleflex',
  },
  {
    category: 'steering_cable',
    engineType: ['outboard'],
    hullClass: ['mid', 'large'],
    amazon: 'Teleflex Safe-T outboard steering cable 15ft 20ft',
    westmarine: 'outboard steering cable 15ft Teleflex',
  },

  // ── SHORE POWER ────────────────────────────────────────────────────────────
  {
    category: 'shore_power_cord',
    engineType: null,
    hullClass: ['small', 'mid'],
    amazon: 'shore power cord 30 amp 25 foot marine boat',
    westmarine: 'shore power cord 30A 25ft',
  },
  {
    category: 'shore_power_cord',
    engineType: null,
    hullClass: ['large'],
    amazon: 'shore power cord 50 amp 30 foot marine boat',
    westmarine: 'shore power cord 50A 30ft',
  },

  // ── AC HVAC ────────────────────────────────────────────────────────────────
  {
    category: 'ac_sea_strainer',
    engineType: null,
    hullClass: null,
    amazon: 'Perko sea strainer marine clear bowl AC cooling',
    westmarine: 'sea strainer marine AC large bowl',
  },
  {
    category: 'ac_raw_water_pump',
    engineType: null,
    hullClass: null,
    amazon: 'Jabsco raw water pump 18680 marine air conditioning',
    westmarine: 'Jabsco AC raw water pump marine',
  },

];

// ── Hull class helper ─────────────────────────────────────────────────────────
function hullClass(hullLength) {
  const ft = parseFloat(hullLength);
  if (!ft || isNaN(ft)) return null;
  if (ft < 22) return 'small';
  if (ft < 32) return 'mid';
  return 'large';
}

// ── HP range helper ───────────────────────────────────────────────────────────
function inHpRange(entry, engineHp) {
  if (!entry.hpRange) return true;
  const hp = parseFloat(engineHp);
  if (!hp || isNaN(hp)) return true; // unknown HP — don't exclude
  return hp >= entry.hpRange[0] && hp <= entry.hpRange[1];
}

// ── Lookup ────────────────────────────────────────────────────────────────────
/**
 * Find the best catalog entry for the given part category and boat profile.
 * @returns {{ amazon: string, westmarine: string } | null}
 */
function lookup(category, boat = {}) {
  const engineType = boat.engine_type || boat.engineType || null;
  const boatHullClass = hullClass(boat.hull_length || boat.hullLength);
  const saltwater = boat.saltwater !== 0 && boat.saltwater !== false;

  const candidates = CATALOG.filter(e => {
    if (e.category !== category) return false;
    if (e.engineType && engineType && !e.engineType.includes(engineType)) return false;
    if (e.hullClass && boatHullClass && !e.hullClass.includes(boatHullClass)) return false;
    if (e.saltwater !== undefined && e.saltwater !== saltwater) return false;
    if (!inHpRange(e, boat.engine_hp || boat.engineHp)) return false;
    return true;
  });

  if (!candidates.length) return null;
  // Return the most specific match (most filters defined)
  candidates.sort((a, b) => {
    const scoreA = (a.engineType ? 2 : 0) + (a.hullClass ? 1 : 0) + (a.hpRange ? 2 : 0);
    const scoreB = (b.engineType ? 2 : 0) + (b.hullClass ? 1 : 0) + (b.hpRange ? 2 : 0);
    return scoreB - scoreA;
  });
  return { amazon: candidates[0].amazon, westmarine: candidates[0].westmarine };
}

module.exports = { CATALOG, lookup };
