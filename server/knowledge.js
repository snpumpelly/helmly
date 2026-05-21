/**
 * Helmly Knowledge Base — 50 curated diagnostic entries (10 per focus system).
 * Retrieved at query time and injected into the AI's context alongside user manual chunks.
 * Written from field experience with recreational vessels.
 */

const KNOWLEDGE_BASE = [

  // ─── SYSTEM: ENGINE START ──────────────────────────────────────────────────

  {
    id: 'start-001',
    system: 'start',
    symptom: 'Key turns, nothing happens — no sound at all',
    likely_causes: ['Safety lanyard (kill switch) disconnected', 'Gear selector not in neutral', 'Main battery switch off'],
    checks: ['Confirm kill switch lanyard is clipped to helm post', 'Confirm throttle/gear lever is in neutral center position', 'Confirm main battery switch is at 1, 2, or ALL'],
    fix_path: 'Work through the three checks above in order. Each takes under 30 seconds. These three causes account for over 60% of no-crank calls on recreational boats.',
    escalate_if: 'All three checked and still no response — proceed to battery voltage test.',
    parts: [],
    tags: ['no-crank', 'silent', 'start', 'lanyard', 'neutral']
  },

  {
    id: 'start-002',
    system: 'start',
    symptom: 'Rapid clicking when key turned (ck-ck-ck-ck)',
    likely_causes: ['Low battery voltage (most common)', 'Corroded battery terminals adding resistance', 'Loose battery cable connection'],
    checks: ['Look for white or blue-green crust on battery terminals', 'Test battery voltage — should be 12.4V or higher at rest', 'Wiggle battery cables — any movement at terminal indicates loose connection'],
    fix_path: 'Mix baking soda + water, pour on terminals, scrub with old toothbrush, rinse, reconnect firmly. If terminals clean and voltage low: charge battery or jump-start.',
    escalate_if: 'Battery voltage is above 12.4V, terminals are clean and tight, clicking persists — starter solenoid or starter motor has failed.',
    parts: ['battery terminal cleaner spray', 'anti-corrosion terminal protector', 'marine battery charger'],
    tags: ['clicking', 'rapid-click', 'battery', 'terminals', 'low-voltage']
  },

  {
    id: 'start-003',
    system: 'start',
    symptom: 'Engine cranks slowly but won\'t fire',
    likely_causes: ['Weak or discharged battery', 'Corroded battery cables reducing current flow', 'Cold engine needing choke or primer'],
    checks: ['Battery voltage under load — below 10.5V while cranking means battery can\'t deliver enough amps', 'Inspect cable thickness — thin corroded cables resist current', 'Cold engine: confirm choke procedure followed per owner\'s manual'],
    fix_path: 'Clean all battery connections. If voltage collapses while cranking, battery needs charging or replacement. For outboards: squeeze primer bulb to firm, set choke, crank max 5 seconds.',
    escalate_if: 'Battery is new and charged, cables are clean, engine still won\'t fire after correct cold-start procedure — fuel delivery or ignition fault.',
    parts: ['marine starting battery 600+ CCA', 'battery cable set 4-gauge marine', 'marine battery terminal cleaning kit'],
    tags: ['slow-crank', 'battery', 'cold-start', 'choke']
  },

  {
    id: 'start-004',
    system: 'start',
    symptom: 'Engine cranks fine but won\'t start — outboard',
    likely_causes: ['Empty fuel tank or stale fuel', 'Primer bulb not pumped firm', 'Engine flooded from repeated cranking attempts'],
    checks: ['Check fuel gauge — confirm fuel in tank', 'Squeeze primer bulb 5–10 times until firm — if it stays soft, there\'s a fuel line air leak', 'If over-cranked: set throttle to WOT (wide open throttle) and crank 5–7 seconds to clear flood'],
    fix_path: 'For flooded engine: WOT position + 5-second crank, then return to idle and try normal start. For carbureted cold start: full choke, firm bulb, crank max 5 seconds.',
    escalate_if: 'Primer bulb firms up, engine isn\'t flooded, still won\'t start after 3–4 attempts — spark or fuel delivery fault requiring diagnostics.',
    parts: ['marine fuel primer bulb assembly', 'STA-BIL marine fuel stabilizer', 'inline fuel filter marine'],
    tags: ['cranks-no-start', 'outboard', 'flooded', 'primer', 'fuel']
  },

  {
    id: 'start-005',
    system: 'start',
    symptom: 'Engine cranks fine but won\'t start — inboard/sterndrive',
    likely_causes: ['Fuel shutoff valve closed', 'Inline fuel filter clogged', 'Distributor cap moisture (older engines)'],
    checks: ['Confirm fuel shutoff valve is open (handle parallel to fuel line)', 'Inspect inline fuel filter — hold to light to check for debris', 'Check distributor cap interior for condensation or cracks — wipe dry'],
    fix_path: 'Spray short burst of starting fluid into air intake — if engine briefly fires then dies, fuel delivery is the issue. Trace fuel path from tank to engine. Replace inline filter.',
    escalate_if: 'Starting fluid test produces no response — ignition system failure or compression issue.',
    parts: ['inline fuel filter marine 5/16', 'starting fluid spray', 'marine distributor cap and rotor kit'],
    tags: ['cranks-no-start', 'inboard', 'sterndrive', 'fuel', 'distributor']
  },

  {
    id: 'start-006',
    system: 'start',
    symptom: 'Engine was running, stopped suddenly, won\'t restart',
    likely_causes: ['Overheating shutdown (engine self-protected)', 'Fuel starvation — ran tank dry or filter clogged', 'Kill switch lanyard pulled accidentally'],
    checks: ['Check temperature gauge — if in red zone, engine overheated and needs to cool 20+ minutes', 'Check fuel level — reserve can fool gauge', 'Inspect kill switch — lanyard may have pulled out without owner noticing'],
    fix_path: 'If overheated: DO NOT restart until cool. Find and fix the cooling issue first (telltale flow, strainer, impeller). If fuel: refill and re-prime. If lanyard: reattach.',
    escalate_if: 'Engine cooled and restarted but immediately overheats again — impeller or thermostat failure.',
    parts: ['marine water pump impeller kit', 'portable fuel jug 6-gallon', 'replacement kill switch lanyard'],
    tags: ['stalled', 'sudden-stop', 'restart', 'overheat', 'fuel']
  },

  {
    id: 'start-007',
    system: 'start',
    symptom: 'Starter motor spins but doesn\'t engage engine (grinding or whirring)',
    likely_causes: ['Bendix/starter drive not engaging ring gear', 'Ring gear teeth worn or broken', 'Starter motor gear stripped'],
    checks: ['Listen carefully — is the starter spinning freely with a whirring sound (not engaging) or grinding (partially engaging)?', 'Whirring = Bendix spring or starter drive failed', 'Grinding = ring gear damage'],
    fix_path: 'Starter drive replacement is a moderate DIY job — remove starter, replace drive mechanism. Ring gear damage requires engine disassembly — escalate.',
    escalate_if: 'Any grinding sound — possible ring gear damage that can worsen rapidly.',
    parts: ['marine starter motor replacement', 'starter drive bendix replacement'],
    tags: ['starter', 'grinding', 'whirring', 'bendix', 'ring-gear']
  },

  {
    id: 'start-008',
    system: 'start',
    symptom: 'Neutral safety switch preventing start',
    likely_causes: ['Faulty neutral safety switch', 'Shift cable out of adjustment — engine thinks it\'s in gear', 'Corroded switch contacts'],
    checks: ['Physically confirm lever is in neutral — sometimes feels like neutral but switch disagrees', 'With engine off, locate neutral safety switch (usually near throttle/shift mechanism) and inspect for corrosion', 'Temporarily bypass by touching the two small switch wires together — if engine cranks, switch is faulty'],
    fix_path: 'Replace neutral safety switch — $15–40 part, 30 minutes. If bypass works, do not run without replacing the switch.',
    escalate_if: 'Bypass does not allow cranking — fault is upstream of the switch (ignition switch or wiring).',
    parts: ['marine neutral safety switch universal', 'marine ignition switch replacement'],
    tags: ['neutral-safety', 'switch', 'wont-crank', 'in-gear']
  },

  {
    id: 'start-009',
    system: 'start',
    symptom: 'Engine starts then immediately dies',
    likely_causes: ['Carburetor idle circuit clogged (varnish from old fuel)', 'Choke releasing too quickly', 'Fuel line sucking air — primer bulb goes soft at idle'],
    checks: ['Does the primer bulb deflate while engine runs at idle? Air leak in fuel line', 'Did the engine start with choke then die as choke released? Idle circuit varnished', 'Check for cracks in fuel line near primer bulb'],
    fix_path: 'Add Sea Foam or equivalent to fuel tank, run engine hard for 30 minutes if possible. For persistent idle issues: carb cleaning or idle jet replacement.',
    escalate_if: 'Primer bulb collapses rapidly while running — fuel line crack or fitting failure causing dangerous raw fuel exposure.',
    parts: ['Sea Foam marine fuel treatment', 'marine carburetor idle jet kit', 'marine fuel line kit with primer bulb'],
    tags: ['starts-dies', 'idle', 'choke', 'fuel-line', 'primer-bulb']
  },

  {
    id: 'start-010',
    system: 'start',
    symptom: 'Battery drains overnight with nothing left on',
    likely_causes: ['Parasitic draw from bilge pump float switch cycling', 'Faulty charging system not restoring battery', 'Battery past service life and unable to hold charge'],
    checks: ['Test battery age — marine batteries over 4 years old in saltwater service are suspect', 'In morning: battery voltage below 12.0V after a full day of charging indicates failing battery', 'Check bilge pump switch setting — AUTO with high bilge water causes overnight drain'],
    fix_path: 'For parasitic draw: disconnect negative cable, put multimeter in series on DC amps setting. Should read under 50mA with everything off. Pull fuses one at a time to identify circuit.',
    escalate_if: 'Battery is new and charged, no parasitic draw found, but still drains — charging system (alternator or voltage regulator) has failed.',
    parts: ['AGM marine battery group 24', 'solar trickle charger 10W marine', 'digital clamp meter DC amps'],
    tags: ['battery-drain', 'parasitic', 'overnight', 'dead-battery']
  },

  // ─── SYSTEM: MARINE HVAC ──────────────────────────────────────────────────

  {
    id: 'hvac-001',
    system: 'hvac',
    symptom: 'AC unit runs but blows warm air — no error code',
    likely_causes: ['Clogged sea strainer restricting raw water flow to condenser (most common)', 'Dirty air filter blocking return air', 'Closed or partially closed seacock'],
    checks: ['Look at the AC overboard discharge fitting — water should flow in a constant stream', 'Check sea strainer bowl — should be clear of debris', 'Check seacock handle — parallel to hose is open'],
    fix_path: 'Close seacock, remove strainer basket, rinse clean, reinstall, reopen seacock. Check discharge flow resumes. Clean air filter (every 2–4 weeks in heavy use).',
    escalate_if: 'Sea strainer is clean, seacock is open, water flows normally, AC still not cooling — refrigerant charge may be low (requires certified tech with gauges).',
    parts: ['sea strainer basket replacement', 'Groco sea strainer marine', 'marine AC air filter replacement'],
    tags: ['warm-air', 'no-cooling', 'strainer', 'seacock', 'hvac']
  },

  {
    id: 'hvac-002',
    system: 'hvac',
    symptom: 'AC trips breaker repeatedly',
    likely_causes: ['Seized seawater pump motor causing overcurrent', 'Failed start capacitor drawing high current at startup', 'Locked compressor'],
    checks: ['Does the unit hum for 1–2 seconds before tripping? Classic start-capacitor or seized-pump signature', 'Has the unit sat unused for 2+ months? Compressor can seize from inactivity', 'Check if seawater pump runs — you should hear it hum and feel vibration at pump housing'],
    fix_path: 'Start capacitor replacement: locate capacitor (cylinder, usually next to compressor), discharge with resistor, swap. $20–40 part, moderate DIY. Seized pump: replace raw water pump.',
    escalate_if: 'Breaker trips instantly with no hum — short circuit in compressor or wiring. Do not reset more than once without inspection.',
    parts: ['marine AC start capacitor replacement', 'Jabsco raw water pump marine AC', 'marine AC raw water pump impeller'],
    tags: ['trips-breaker', 'hum', 'capacitor', 'pump', 'compressor', 'hvac']
  },

  {
    id: 'hvac-003',
    system: 'hvac',
    symptom: 'HPF (High Pressure Fault) error code',
    likely_causes: ['Insufficient seawater flow to condenser — strainer, seacock, or pump failure', 'Discharge hose kinked preventing water exit', 'Condenser scaling from mineral buildup'],
    checks: ['Confirm water flow at discharge fitting — should be steady stream at all times unit runs', 'Follow discharge hose for kinks from pump to thru-hull fitting', 'How long since last descale treatment? Annual is recommended in hard-water areas'],
    fix_path: 'Work through the water flow path systematically: seacock → strainer → pump → discharge hose → thru-hull. Fix the first restriction found. Descale with Rydlyme or similar marine AC descaler.',
    escalate_if: 'All water flow checks pass and HPF persists — high-side refrigerant pressure issue requiring certified AC tech.',
    parts: ['Rydlyme marine descaler', 'sea strainer large capacity marine', 'marine AC flow switch replacement'],
    tags: ['HPF', 'high-pressure-fault', 'water-flow', 'descale', 'hvac']
  },

  {
    id: 'hvac-004',
    system: 'hvac',
    symptom: 'LO (Low Flow) error code',
    likely_causes: ['Same as HPF — insufficient raw water flow', 'Flow switch has failed or stuck closed', 'Strainer clogged in grass-heavy or tropical water (can happen in minutes)'],
    checks: ['In tropical or grass-heavy anchorages, check strainer even if cleaned recently — can clog in 30 minutes', 'If flow is confirmed good, test flow switch — should have continuity when water flows through it', 'Inspect for debris in pump impeller'],
    fix_path: 'Clean strainer first — takes 5 minutes and resolves LO in majority of cases. If flow confirmed and code persists, replace flow switch ($30–60).',
    escalate_if: 'Flow switch replaced and code persists — control board or wiring issue.',
    parts: ['marine AC flow switch', 'sea strainer basket replacement', 'Jabsco impeller replacement'],
    tags: ['LO', 'low-flow', 'flow-switch', 'strainer', 'hvac']
  },

  {
    id: 'hvac-005',
    system: 'hvac',
    symptom: 'AC makes loud grinding or rattling noise',
    likely_causes: ['Debris in seawater pump impeller', 'Loose blower wheel on evaporator fan', 'Failed blower motor bearing'],
    checks: ['Is noise from below (pump area) or above (air handler unit)?', 'Below: debris in raw water pump — often a shell, pebble, or piece of barnacle', 'Above: blower wheel loose on shaft — inspect by removing unit cover, wiggle wheel'],
    fix_path: 'For pump debris: close seacock, remove pump cover, clear impeller cavity, inspect impeller for damage, reinstall. For loose blower: tighten set screw on wheel hub.',
    escalate_if: 'Metal-on-metal grinding from compressor area — compressor bearing failure.',
    parts: ['Jabsco raw water pump impeller', 'marine AC blower motor replacement'],
    tags: ['noise', 'grinding', 'rattling', 'pump', 'blower', 'hvac']
  },

  {
    id: 'hvac-006',
    system: 'hvac',
    symptom: 'AC unit completely dead — no display, no fan',
    likely_causes: ['AC circuit breaker tripped on 120V panel', 'Shore power not reaching boat', 'AC unit fuse blown on control board'],
    checks: ['Check 120V panel — AC circuit breaker tripped?', 'Test a 120V outlet (phone charger) to confirm shore power is live', 'Locate AC unit control board — small fuse on board often blows on lightning-adjacent events'],
    fix_path: 'Reset breaker (OFF then ON). If breaker holds, check for control board fuse (consult unit service manual — usually a 5A fuse). Replace if blown.',
    escalate_if: 'Breaker trips again immediately — short circuit in AC wiring or unit.',
    parts: ['marine AC fuse kit', 'GFCI outlet marine grade'],
    tags: ['dead', 'no-power', 'breaker', 'shore-power', 'hvac']
  },

  {
    id: 'hvac-007',
    system: 'hvac',
    symptom: 'Condensate (water) dripping inside the boat from AC unit',
    likely_causes: ['Condensate drain line clogged with algae or debris', 'Drain pan overflowing', 'Unit not level — condensate pools to wrong side'],
    checks: ['Locate condensate drain line (small flexible hose from air handler to bilge or overboard)', 'Blow through hose to test for blockage — should flow freely', 'Inspect drain pan under evaporator coil for standing water'],
    fix_path: 'Flush drain line with white vinegar + water solution (50/50). Add condensate drain pan tablets monthly to prevent algae growth. Check unit leveling.',
    escalate_if: 'Drain line clear but condensation excessive — refrigerant may be low causing coil to ice up and flood.',
    parts: ['condensate drain pan tablets marine', 'flexible condensate drain hose'],
    tags: ['dripping', 'condensate', 'drain', 'water-inside', 'hvac']
  },

  {
    id: 'hvac-008',
    system: 'hvac',
    symptom: 'AC cools some cabins but not others on a multi-zone system',
    likely_causes: ['Air handler in warm cabin has its own issue (strainer, breaker, filter)', 'Duct disconnected or blocked in warm cabin', 'Zone control valve not opening'],
    checks: ['Each zone typically has its own sea strainer on multi-zone systems — check the strainer for the warm zone', 'Confirm the zone breaker on the AC sub-panel is on', 'Listen at air outlet — any airflow at all?'],
    fix_path: 'Treat each zone as an independent unit for diagnostic purposes. A zone with no airflow has a failed blower or blocked duct. A zone with airflow but warm air has a water flow or refrigerant issue.',
    escalate_if: 'Multiple zones failing simultaneously — central pump or refrigerant system issue.',
    parts: ['sea strainer basket marine', 'marine AC zone control valve'],
    tags: ['multi-zone', 'partial-cooling', 'zones', 'hvac']
  },

  {
    id: 'hvac-009',
    system: 'hvac',
    symptom: 'AC runs but humidity stays very high',
    likely_causes: ['Undersized unit for cabin volume', 'Air filter extremely dirty reducing airflow over evaporator', 'Low refrigerant charge reducing dehumidification capacity'],
    checks: ['When did you last clean the air filter? A clogged filter dramatically reduces dehumidification', 'Is the unit running constantly (never cycling off)? May be undersized', 'Check supply air temp at vents — should be at least 15–20°F cooler than return air temp'],
    fix_path: 'Clean air filter immediately. Ensure all return air paths are unobstructed (cushions, furniture not blocking return grilles). Run unit continuously in humid conditions rather than cycling.',
    escalate_if: 'Filter is clean, supply air is cold, but humidity stays above 70% — low refrigerant reducing latent cooling capacity.',
    parts: ['marine AC air filter', 'hygrometer digital (to measure cabin humidity)'],
    tags: ['humidity', 'dehumidification', 'filter', 'hvac']
  },

  {
    id: 'hvac-010',
    system: 'hvac',
    symptom: 'AC raw water pump runs but weak discharge flow',
    likely_causes: ['Impeller worn or vanes broken off', 'Air leak on suction side of pump reducing prime', 'Inlet hose partially kinked'],
    checks: ['Perform bucket test: time how long to fill 1-gallon bucket at discharge — compare to pump spec GPH', 'Disconnect suction hose at pump and check for airlock — air bubbles visible during pump operation indicate suction leak', 'Inspect entire inlet hose run for kinks or soft spots'],
    fix_path: 'Replace impeller — most common cause of reduced flow after strainer is clear. Coat new impeller with dish soap, press in with vanes bent against rotation direction. $15–30 part.',
    escalate_if: 'New impeller installed, suction line clear, still weak flow — pump housing worn or pump motor weak.',
    parts: ['Jabsco impeller 17937-0001', 'marine AC raw water pump Jabsco', 'impeller puller tool marine'],
    tags: ['weak-flow', 'pump', 'impeller', 'suction', 'hvac']
  },

  // ─── SYSTEM: 12V/24V ELECTRICAL ───────────────────────────────────────────

  {
    id: 'elec-001',
    system: 'electrical',
    symptom: 'Entire 12V electrical system dead',
    likely_causes: ['Main battery switch off or in wrong position', 'Main fuse or fusible link blown', 'Corroded or disconnected main ground cable'],
    checks: ['Battery switch position — confirm on 1, 2, or ALL', 'Locate ANL or main fuse near battery positive terminal — visual inspection for gap or burn mark', 'Inspect negative battery cable connection at both battery and engine block for corrosion'],
    fix_path: 'Replace blown main fuse with exact same amperage. Clean corroded ground connections. Never upsize a fuse.',
    escalate_if: 'Main fuse blows again on replacement — there is a direct short circuit in the system.',
    parts: ['ANL fuse assortment marine 100A-300A', 'ANL fuse holder marine', 'battery terminal cleaning kit'],
    tags: ['dead-system', 'main-fuse', 'battery-switch', 'ground', 'electrical']
  },

  {
    id: 'elec-002',
    system: 'electrical',
    symptom: 'Single circuit or device not working',
    likely_causes: ['Tripped circuit breaker', 'Blown device fuse', 'Corroded connection at device or in wiring run'],
    checks: ['Check breaker panel — tripped breaker is in middle position or shows red indicator', 'Check device for its own internal fuse (many accessories have one)', 'Test voltage at device terminals — 12V present means device has failed; 0V means wiring issue'],
    fix_path: 'Reset breaker (OFF then ON). If device has internal fuse, replace. If wiring is the issue, work backward from device testing voltage at each junction until you find the fault.',
    escalate_if: 'Breaker resets but trips again immediately — overloaded circuit or short in that branch.',
    parts: ['marine blade fuse assortment', 'marine circuit breaker 15A panel', 'multimeter auto-ranging digital'],
    tags: ['single-circuit', 'breaker', 'fuse', 'device', 'electrical']
  },

  {
    id: 'elec-003',
    system: 'electrical',
    symptom: 'Navigation lights not working',
    likely_causes: ['Burned-out bulb (most common)', 'Corroded socket or corroded bulb base', 'Tripped nav light circuit breaker'],
    checks: ['Check nav lights circuit breaker/switch on panel', 'Remove lens cover and inspect bulb — burned filament visible', 'Check socket for green corrosion — common on weather-exposed bow and stern lights'],
    fix_path: 'Clean socket contacts with emery cloth. Replace bulb. Upgrade to marine LED — 10× longer life, 80% less power draw, direct drop-in replacement for most fixtures.',
    escalate_if: 'Voltage present at fixture but LED replacement also doesn\'t light — socket has open ground.',
    parts: ['marine LED navigation light bulb BA15s', 'LED navigation light fixture marine', 'CRC electrical contact cleaner'],
    tags: ['nav-lights', 'running-lights', 'LED', 'bulb', 'electrical']
  },

  {
    id: 'elec-004',
    system: 'electrical',
    symptom: 'Battery won\'t hold charge — drains in hours',
    likely_causes: ['Battery past service life (common over 4 years in marine use)', 'Charging system not restoring battery while engine runs', 'Parasitic draw from hidden load'],
    checks: ['Battery resting voltage 12+ hours after full charge — below 12.4V suggests sulfation', 'Start engine, check battery voltage — should rise to 13.5–14.5V (alternator charging)', 'With everything off: multimeter in series on negative cable, reading above 100mA indicates parasitic draw'],
    fix_path: 'Load-test battery — any auto parts store does this free. If fails: replace. If alternator not charging, test alternator output. Find parasitic draw by pulling fuses one at a time.',
    escalate_if: 'New battery and alternator confirmed good, but parasitic draw can\'t be found — complex wiring fault.',
    parts: ['AGM marine battery group 27', 'battery load tester 12V', 'digital clamp meter DC amps'],
    tags: ['battery', 'drain', 'charging', 'parasitic', 'alternator', 'electrical']
  },

  {
    id: 'elec-005',
    system: 'electrical',
    symptom: 'Alternator not charging battery',
    likely_causes: ['Broken or loose alternator belt', 'Failed voltage regulator', 'Bad alternator diode (one of six internal diodes failed)'],
    checks: ['Inspect alternator belt — missing, cracked, or loose?', 'With engine running: battery voltage should read 13.5–14.5V. Below 13V = not charging', 'Check alternator warning light on dash — illuminated while running confirms charging fault'],
    fix_path: 'Belt replacement: moderate DIY, 30–60 minutes. Alternator replacement: moderate DIY if accessible. Always carry a spare belt on long passages.',
    escalate_if: 'Belt is intact and alternator replaced but voltage still low — wiring fault in charging circuit or external voltage regulator issue.',
    parts: ['marine alternator belt (search engine model)', 'marine alternator replacement', 'spare alternator belt'],
    tags: ['alternator', 'charging', 'belt', 'voltage-regulator', 'electrical']
  },

  {
    id: 'elec-006',
    system: 'electrical',
    symptom: 'Bilge pump not activating automatically',
    likely_causes: ['Float switch stuck down or fouled with debris', 'Bilge pump switch set to OFF instead of AUTO', 'Blown bilge pump fuse'],
    checks: ['Helm switch in AUTO position?', 'Reach into bilge and manually lift float switch — if pump runs, float is fouled', 'Check bilge pump fuse (usually 15A or 20A, inline or on panel)'],
    fix_path: 'Clean float switch — remove debris from around it. Ensure no wires or hoses hold float in down position. Replace fuse if blown.',
    escalate_if: 'Float switch activates manually, fuse is good, but pump won\'t run — pump motor has failed (replace).',
    parts: ['bilge pump automatic float switch', 'Rule 1500 GPH bilge pump', 'waterproof inline fuse holder marine'],
    tags: ['bilge-pump', 'float-switch', 'AUTO', 'fuse', 'electrical']
  },

  {
    id: 'elec-007',
    system: 'electrical',
    symptom: 'VHF radio or chart plotter losing power intermittently',
    likely_causes: ['Loose push-on connector at back of unit vibrating loose underway', 'Undersized wire causing voltage drop under load', 'Corroded inline fuse holder in wiring run'],
    checks: ['With device off: wiggle the connector at the back of the unit — any movement?', 'Check voltage at device terminals while device is running — should be 12V ± 0.5V', 'Locate any inline fuse holder in the wire run and inspect for green corrosion inside'],
    fix_path: 'Replace corroded inline fuse holder with sealed marine-grade unit. Crimp a new push-on terminal if loose. Use heat-shrink connectors — open crimp connectors corrode quickly in marine environment.',
    escalate_if: 'Voltage good and connections solid but device still drops power — device power supply failed.',
    parts: ['marine wire connector kit heat shrink', 'waterproof inline fuse holder marine', 'tinned marine wire 14 AWG'],
    tags: ['VHF', 'chartplotter', 'intermittent', 'connector', 'fuse-holder', 'electrical']
  },

  {
    id: 'elec-008',
    system: 'electrical',
    symptom: 'Shore power trips dock pedestal GFCI or boat breaker repeatedly',
    likely_causes: ['Moisture in shore power connector (most common)', 'Damaged shore power cord with current leaking to ground', 'Faulty GFCI on dock pedestal detecting stray current'],
    checks: ['Inspect shore power connector at boat inlet — any green corrosion, moisture, or discoloration?', 'Try a different pedestal outlet if available — if holds, pedestal GFCI is faulty', 'Inspect entire shore power cord for cracks or damage'],
    fix_path: 'Dry and clean the shore power connector. If cord is damaged, replace — do not tape or repair marine shore power cords. A damaged cord is a fire and electrocution hazard.',
    escalate_if: 'Cord and connector are fine, pedestal is confirmed good, but boat breaker still trips — wiring fault inside boat\'s AC system.',
    parts: ['shore power cable 30A 25ft marine', 'shore power inlet 30A marine', 'GFCI outlet marine grade'],
    tags: ['shore-power', 'GFCI', 'trips', 'pedestal', 'cord', 'electrical']
  },

  {
    id: 'elec-009',
    system: 'electrical',
    symptom: 'Mysterious corrosion on underwater metals (zincs, props, shaft)',
    likely_causes: ['Stray current corrosion from faulty wiring (most serious)', 'Incorrect or missing zincs', 'Shore power ground fault creating galvanic acceleration'],
    checks: ['Are zincs wasting faster than expected (more than 50% in 6 months)?', 'Any other boats in marina showing rapid zinc loss? Could be marina stray current', 'Check for any DC wiring with exposed copper near bilge water'],
    fix_path: 'Replace zincs with correct alloy for water type (zinc for salt, magnesium for fresh, aluminum for brackish). Inspect all DC wiring for any damaged insulation.',
    escalate_if: 'Zincs wasting within weeks, visible pitting on prop or shaft — stray current corrosion requires marine electrician with galvanic isolator test equipment.',
    parts: ['zinc anode set marine', 'galvanic isolator 30A marine', 'shaft zinc anode'],
    tags: ['corrosion', 'zincs', 'stray-current', 'galvanic', 'electrical']
  },

  {
    id: 'elec-010',
    system: 'electrical',
    symptom: 'Battery switch position confusion — dual bank system',
    likely_causes: ['Not a fault — common owner education need', 'Wrong bank selected for starting depletes house bank', 'Improper switch usage combining banks when one is low'],
    checks: ['Position 1 = start/port bank only, Position 2 = house/starboard bank only, ALL = both banks connected', 'Best practice: start on BOTH/ALL, switch to house bank only for loads, charge both banks while underway', 'Dedicated start battery: keep on position 1 for starting, switch to 2 for loads'],
    fix_path: 'Install a battery combiner or automatic charging relay (ACR) — it automatically combines banks when charging and separates when the engine is off. Eliminates human error.',
    escalate_if: 'Not applicable — this is an education item.',
    parts: ['Blue Sea ACR automatic charging relay', 'marine battery switch 1-2-BOTH', 'battery monitor digital marine'],
    tags: ['battery-switch', 'dual-bank', 'ACR', 'education', 'electrical']
  },

  // ─── SYSTEM: ENGINE (RUNNING) ──────────────────────────────────────────────

  {
    id: 'engine-001',
    system: 'engine',
    symptom: 'Engine overheating — temperature alarm or gauge in red',
    likely_causes: ['Clogged sea strainer (most common)', 'Failed raw water pump impeller', 'Stuck thermostat (closed)'],
    checks: ['STOP ENGINE IMMEDIATELY. Check water telltale stream — no flow = no cooling', 'Inspect sea strainer bowl — clogged with weeds, shells, or plastic?', 'When was impeller last replaced? Should be every 2 years or 200 hours'],
    fix_path: 'Clean strainer (5 minutes). If strainer is clean and no telltale flow: impeller replacement. Let engine cool 20+ minutes before restarting — even 2–3 minutes overheated can warp cylinder head.',
    escalate_if: 'Strainer clean, impeller new, telltale flowing, engine still overheats — thermostat stuck closed or heat exchanger blockage.',
    parts: ['marine water pump impeller kit', 'sea strainer basket replacement', 'marine engine thermostat 160F'],
    tags: ['overheating', 'temperature', 'alarm', 'impeller', 'strainer', 'engine']
  },

  {
    id: 'engine-002',
    system: 'engine',
    symptom: 'Engine runs rough or misfires at all speeds',
    likely_causes: ['Fouled or worn spark plugs', 'Failed ignition coil on one cylinder', 'Water in fuel'],
    checks: ['When were plugs last replaced? Marine plugs should be changed every 100 hours or 2 years', 'Inspect spark plug condition: black/sooty = running rich, white/blistered = running lean, oily = oil burning', 'Check Racor/fuel filter bowl for water — clear bowl with water droplets at bottom'],
    fix_path: 'Replace spark plugs first — resolves rough running in 30% of cases and costs $30–60. Check fuel filter for water. If specific cylinder misfires: test ignition coil for that cylinder.',
    escalate_if: 'White or blistered plugs indicate lean running — serious fault, do not continue operating.',
    parts: ['NGK marine spark plugs', 'Racor fuel filter element', 'inline spark tester'],
    tags: ['rough', 'misfire', 'spark-plugs', 'ignition', 'fuel', 'engine']
  },

  {
    id: 'engine-003',
    system: 'engine',
    symptom: 'Engine won\'t reach full throttle or RPM',
    likely_causes: ['Clogged fuel filter starving engine at high demand', 'Spun propeller hub', 'Throttle cable binding or disconnected at engine'],
    checks: ['Engine reaches full RPM on tach but boat doesn\'t accelerate: spun hub', 'Engine RPM limited and won\'t rev: fuel or throttle restriction', 'Inspect throttle cable at engine — confirm full travel when helm is pushed to WOT'],
    fix_path: 'Replace fuel filter. Inspect prop hub for spin (prop spins by hand after removal). Lubricate and inspect throttle cable for kinks or disconnection.',
    escalate_if: 'Throttle cable confirmed full travel, fuel filter new, prop solid — internal engine power limitation requiring diagnostic.',
    parts: ['Racor fuel filter 500 series', 'propeller hub replacement kit', 'marine cable lubricant'],
    tags: ['full-throttle', 'RPM', 'spun-hub', 'throttle-cable', 'engine']
  },

  {
    id: 'engine-004',
    system: 'engine',
    symptom: 'Engine exhaust is black or very smoky',
    likely_causes: ['Running too rich — choke stuck, carburetor float stuck high', 'Clogged air filter reducing oxygen to combustion', 'Overly dark 2-stroke oil mixture'],
    checks: ['Is smoke constant or only at startup? Startup puff of smoke is normal in cold engines', 'Inspect air filter — if black and clogged, replace', 'On 2-strokes: check oil-to-fuel ratio — confirm you\'re using correct marine 2-stroke oil at correct ratio'],
    fix_path: 'Replace air filter. On carbureted engines: check choke is releasing fully when warm. Add fuel injector cleaner to tank. For 2-strokes: confirm mix ratio per engine manual.',
    escalate_if: 'Blue-gray smoke (oil burning) at all operating temperatures — piston rings or valve seals. Engine is consuming oil.',
    parts: ['marine outboard air filter element', 'fuel injector cleaner marine', 'marine 2-stroke engine oil'],
    tags: ['black-smoke', 'smoky', 'rich', 'air-filter', 'engine']
  },

  {
    id: 'engine-005',
    system: 'engine',
    symptom: 'Engine idles fine but stumbles badly under acceleration',
    likely_causes: ['Fuel filter clogged — can\'t supply volume at demand', 'Accelerator pump in carburetor worn or clogged', 'Air leak in intake — sucks air at idle but leans out under vacuum at throttle-up'],
    checks: ['Remove fuel filter and inspect — dark or restricted? Replace', 'Apply soapy water to all intake manifold joints and carburetor base while idling — bubbles reveal air leaks', 'Squeeze primer bulb during stumble — if stumble clears, fuel starvation confirmed'],
    fix_path: 'Replace fuel filter as first step. For carbureted engines: accelerator pump replacement in carburetor rebuild kit. Seal any air leaks found at intake.',
    escalate_if: 'Fuel filter new, no air leaks, primer bulb firm — fuel injector fault or fuel pump weakness under load.',
    parts: ['inline fuel filter marine', 'marine carburetor rebuild kit', 'Racor 500 fuel water separator'],
    tags: ['stumble', 'acceleration', 'fuel-filter', 'carburetor', 'air-leak', 'engine']
  },

  {
    id: 'engine-006',
    system: 'engine',
    symptom: 'Engine oil pressure warning light on while running',
    likely_causes: ['Low oil level', 'Oil pressure sender fault (sensor, not pressure)', 'Actual low oil pressure — engine damage risk'],
    checks: ['REDUCE SPEED IMMEDIATELY. Check oil dipstick level — low?', 'Is the light constant or flickering at idle only? Flickering at idle only may be sender', 'Listen for knocking or tapping noise — knock confirms actual low pressure'],
    fix_path: 'Check and add oil immediately if low. Do not run with oil pressure warning. If level is correct and light persists at all RPM: shut down. Do not confuse with a faulty sender — confirm before continuing.',
    escalate_if: 'Oil level is correct and light is on at all speeds — possible oil pump failure or internal engine issue. Do not operate.',
    parts: ['marine engine oil 4-stroke', 'oil pressure sender replacement marine'],
    tags: ['oil-pressure', 'warning-light', 'oil-level', 'knock', 'engine']
  },

  {
    id: 'engine-007',
    system: 'engine',
    symptom: 'Engine knocking or pinging sound',
    likely_causes: ['Incorrect fuel octane (too low)', 'Ignition timing advanced too far', 'Carbon buildup causing pre-ignition (hot spots)'],
    checks: ['What octane fuel are you running? Most marine engines require 87–89 minimum, some 91+', 'Did knock begin after fueling? Possible low-octane or ethanol-blend fuel', 'Is knock consistent or only under load?'],
    fix_path: 'Fill with higher octane fuel (premium) and run for several tanks. Add a fuel system cleaner to address carbon buildup. If knock persists at correct octane: timing or mechanical issue.',
    escalate_if: 'Heavy knock under any load — immediate shutdown. Continued operation causes catastrophic internal damage.',
    parts: ['premium marine fuel treatment octane booster', 'Sea Foam marine fuel treatment'],
    tags: ['knock', 'ping', 'octane', 'timing', 'carbon', 'engine']
  },

  {
    id: 'engine-008',
    system: 'engine',
    symptom: 'Water in the bilge after running engine — exhaust water',
    likely_causes: ['Exhaust wet elbow cracked or failed', 'Exhaust hose deteriorated — pinhole leak', 'Siphon break on water-lift muffler has failed, allowing water to flow back'],
    checks: ['Inspect exhaust hose run — look for staining, cracks, or wet spots along hose', 'Check wet elbow (metal fitting where raw water injects into exhaust) — rust stains or visible cracks?', 'When engine is off: is water dripping into exhaust system from muffler?'],
    fix_path: 'Replace cracked wet elbow — cast iron or stainless, $50–200, moderate DIY. Replace deteriorated exhaust hose. Siphon break replacement: $20–40.',
    escalate_if: 'Water accumulating rapidly in bilge while running — possible exhaust manifold crack. Shut down and inspect.',
    parts: ['marine wet exhaust elbow replacement', 'exhaust hose marine 2 inch', 'siphon break valve marine'],
    tags: ['water-in-bilge', 'exhaust', 'wet-elbow', 'siphon', 'engine']
  },

  {
    id: 'engine-009',
    system: 'engine',
    symptom: 'Fuel consumption dramatically higher than usual',
    likely_causes: ['Fouled bottom (barnacles/growth) increasing drag', 'Prop damaged or wrong pitch — engine working harder', 'Engine running rich from stuck choke or clogged air filter'],
    checks: ['When was bottom last cleaned? Fouled bottom can increase fuel consumption 20–30%', 'Inspect prop for damage, bends, or heavy barnacle growth on blades', 'Inspect air filter — black, clogged filter makes engine run rich'],
    fix_path: 'Have bottom cleaned (haul-out or diver). Clean prop blades. Replace air filter. Run engine diagnostics if consumption still high.',
    escalate_if: 'Sudden dramatic increase in fuel consumption in a single trip — possible compression loss or fuel system fault.',
    parts: ['marine bottom cleaning service (diver)', 'marine outboard air filter element', 'hull cleaner barnacle remover'],
    tags: ['fuel-consumption', 'economy', 'barnacles', 'prop', 'rich', 'engine']
  },

  {
    id: 'engine-010',
    system: 'engine',
    symptom: 'Engine vibrates excessively at all RPM',
    likely_causes: ['Prop out of balance — bent blade or debris wrapped around shaft', 'Engine mounts worn or failed', 'Prop shaft bent from impact'],
    checks: ['Inspect prop with engine off — any bent blades, chunks missing, or rope/line wrapped?', 'Rev engine to various RPMs — does vibration frequency change with RPM? Yes = prop/shaft related', 'Inspect rubber engine mounts — visible cracking or collapse of rubber section?'],
    fix_path: 'Remove and inspect prop. Have prop professionally balanced if blades look straight. Replace visibly deteriorated engine mounts.',
    escalate_if: 'Vibration is severe at all speeds and prop looks fine — possible bent shaft requiring haul-out measurement.',
    parts: ['propeller puller tool marine', 'marine engine mount set (search engine model)'],
    tags: ['vibration', 'prop', 'engine-mounts', 'shaft', 'balance', 'engine']
  },

  // ─── SYSTEM: AC SHORE POWER / POWER DISTRIBUTION ──────────────────────────

  {
    id: 'power-001',
    system: 'power',
    symptom: 'No 120V AC power anywhere on boat',
    likely_causes: ['Shore power cord not fully plugged in', 'Main AC breaker on boat\'s panel tripped', 'No power at dock pedestal'],
    checks: ['Confirm shore power cord is fully seated at both the dock pedestal and boat inlet', 'Check boat\'s 120V panel — main AC breaker tripped?', 'Test pedestal with phone charger or lamp — is dock power actually on?'],
    fix_path: 'Press RESET on any pedestal GFCI. Reset main AC breaker. Re-seat shore power connection. If pedestal is dead, contact marina.',
    escalate_if: 'Pedestal has power, cord is connected, main breaker is on, but still no AC — possible break in boat\'s AC wiring or failed main AC transfer switch.',
    parts: ['shore power cable 30A 25ft', 'marine shore power inlet 30A'],
    tags: ['no-AC', 'shore-power', 'breaker', 'pedestal', 'power']
  },

  {
    id: 'power-002',
    system: 'power',
    symptom: 'Shore power cord or inlet very hot to the touch',
    likely_causes: ['Corroded or loose connection creating resistance and heat', 'Undersized cord for load being drawn', 'Damaged cord insulation with partial short to ground'],
    checks: ['DISCONNECT SHORE POWER IMMEDIATELY. A hot connector is a fire hazard.', 'Inspect plug and inlet for discoloration, melting, or burn marks', 'Check cord ampacity — 30A cord on a 50A pedestal is dangerous'],
    fix_path: 'Do not use a hot, discolored, or melted shore power connection. Replace cord and inspect boat-side inlet. This is a fire and electric shock hazard.',
    escalate_if: 'Always escalate — any melted or discolored shore power component must be replaced before further use.',
    parts: ['shore power cable 30A marine replacement', 'shore power inlet 30A marine replacement'],
    tags: ['hot-cord', 'overheating', 'fire-hazard', 'shore-power', 'power']
  },

  {
    id: 'power-003',
    system: 'power',
    symptom: 'Inverter not producing AC output',
    likely_causes: ['Inverter switched off or in standby mode', 'DC input voltage too low (battery discharged)', 'Overload or overtemperature shutdown'],
    checks: ['Check inverter power switch and mode (many have remote switches that get left off)', 'Check DC input voltage at inverter terminals — most require 11.5V minimum', 'Check inverter display for fault code or overload/overtemp indicator'],
    fix_path: 'Charge battery bank. Reset inverter by cycling power. Reduce load — inverters trip on overload (check watt rating vs. load).',
    escalate_if: 'Battery voltage good, no fault code, inverter won\'t produce output — inverter has failed internally.',
    parts: ['marine inverter charger replacement', 'marine battery bank AGM 200Ah'],
    tags: ['inverter', 'no-AC', 'battery', 'overload', 'power']
  },

  {
    id: 'power-004',
    system: 'power',
    symptom: 'Generator runs but won\'t supply AC power to boat',
    likely_causes: ['Generator output breaker tripped', 'Transfer switch not switching from shore to generator', 'Generator AC output voltage out of spec'],
    checks: ['Locate generator output breaker on generator housing — tripped?', 'Manual or automatic transfer switch — confirm it has switched to generator source', 'Check generator voltage with multimeter: should read 115–125V AC at output terminals'],
    fix_path: 'Reset generator output breaker. Manually switch transfer switch if auto-switch has failed. Test generator output voltage — if out of range, voltage regulator (AVR) has failed.',
    escalate_if: 'Generator voltage is severely out of spec — running loads on wrong voltage can damage electronics.',
    parts: ['marine transfer switch automatic', 'generator voltage regulator AVR replacement'],
    tags: ['generator', 'transfer-switch', 'output-breaker', 'AVR', 'power']
  },

  {
    id: 'power-005',
    system: 'power',
    symptom: 'GFCI outlet trips when device is plugged in',
    likely_causes: ['Device being plugged in has a ground fault (faulty device)', 'GFCI outlet itself has failed and is nuisance-tripping', 'Moisture in outlet or device plug'],
    checks: ['Try a different, known-good device in the outlet — if it holds, the original device is faulty', 'Try a different outlet — if GFCI holds, the original outlet has failed', 'Inspect plug for moisture or corrosion'],
    fix_path: 'Replace faulty device or faulty GFCI outlet. GFCI outlets in marine environments fail after 3–5 years from moisture cycling. Replace with marine-grade GFCI.',
    escalate_if: 'All devices trip all GFCI outlets — fault in the AC wiring system, not devices or outlets.',
    parts: ['GFCI outlet marine grade 15A', 'GFCI outlet marine grade 20A'],
    tags: ['GFCI', 'trips', 'ground-fault', 'outlet', 'power']
  },

  {
    id: 'power-006',
    system: 'power',
    symptom: 'Battery charger on shore power not charging batteries',
    likely_causes: ['Charger in storage/float mode and not bulk-charging', 'Battery bank voltage too high triggering absorption cutoff', 'Charger fault or failed output stage'],
    checks: ['Check charger display — what mode is it showing? Float/storage = normal if battery is full', 'Test battery voltage at terminals with engine off — if 12.7V+, battery is full and charger is correct', 'Check charger AC input — test the outlet the charger is plugged into'],
    fix_path: 'If battery is discharged and charger shows float: disconnect battery briefly to reset charger\'s detection cycle. Confirm AC input is live at charger.',
    escalate_if: 'Battery is discharged, AC confirmed live at charger, charger shows no output — charger has failed.',
    parts: ['marine battery charger 40A three-bank', 'ProMariner battery charger marine'],
    tags: ['battery-charger', 'shore-power', 'float-mode', 'not-charging', 'power']
  },

  {
    id: 'power-007',
    system: 'power',
    symptom: 'Reverse polarity warning light on shore power inlet',
    likely_causes: ['Dock pedestal is incorrectly wired — hot and neutral are swapped', 'Defective or damaged shore power cord with wires swapped internally'],
    checks: ['Try a different outlet on the same pedestal', 'Try your cord on a pedestal at a different dock — if light goes off, the original pedestal is wired incorrectly', 'Inspect shore power cord for damage or home repairs with swapped wires'],
    fix_path: 'Do not connect to a reverse-polarity pedestal — it bypasses your boat\'s grounding and creates shock and galvanic corrosion risk. Report to marina. Use a reverse-polarity adapter only as a temporary measure.',
    escalate_if: 'Always report reverse polarity to the marina. Do not use power until fixed.',
    parts: ['reverse polarity adapter marine (temporary)', 'shore power cord replacement 30A'],
    tags: ['reverse-polarity', 'shore-power', 'pedestal', 'wiring', 'power']
  },

  {
    id: 'power-008',
    system: 'power',
    symptom: 'Solar panels not charging battery bank',
    likely_causes: ['Solar charge controller fault or in float mode', 'Shading on panels (even partial shade kills output)', 'Blown fuse between panels and controller'],
    checks: ['Check charge controller display — what is the input voltage and charge current?', 'Are panels in direct sun? Even 10% shade from a mast or antenna can cut output by 50%+', 'Inspect fuse between solar panel array and charge controller'],
    fix_path: 'Reposition boat to reduce panel shading. Check controller settings — absorption voltage setpoint should be 14.4–14.8V for flooded lead-acid, 14.2–14.6V for AGM. Replace blown fuse.',
    escalate_if: 'Controller shows good input voltage but zero output current with discharged batteries — controller has failed.',
    parts: ['MPPT solar charge controller marine', 'solar panel fuse kit marine', 'digital battery monitor Victron'],
    tags: ['solar', 'charge-controller', 'MPPT', 'shading', 'fuse', 'power']
  },

  {
    id: 'power-009',
    system: 'power',
    symptom: 'Electrical burning smell on boat',
    likely_causes: ['Overheating wire at undersized connection or loose terminal', 'Arcing at corroded connection', 'Motor (bilge pump, blower) seized and drawing high current'],
    checks: ['Locate the source — sniff at panel, wire runs under sole, and near any motors', 'Check all breakers — any warm or hot to the touch?', 'Inspect bilge pump and blower motors — feel for heat at motor housing'],
    fix_path: 'Turn off all circuits one at a time while sniffing for source. Do not run boat until source is found. Burning electrical smell always indicates a genuine fault.',
    escalate_if: 'Any burning smell requires investigation before underway operation — this is a fire precursor.',
    parts: ['marine wire connector kit heat shrink', 'marine blade fuse assortment'],
    tags: ['burning-smell', 'fire', 'arcing', 'loose-connection', 'power']
  },

  {
    id: 'power-010',
    system: 'power',
    symptom: 'Boat electronics reset or reboot when engine starts',
    likely_causes: ['Voltage drop during cranking pulling below minimum for electronics', 'Ground loop — electronics grounded to engine rather than dedicated ground bus', 'Insufficient battery capacity for combined starting + electronics load'],
    checks: ['Do electronics reset only at the moment of engine crank? Normal if battery is slightly low', 'Are chartplotters and VHF grounded to the engine block or a dedicated electronics ground bus?', 'Test battery voltage during cranking — should not drop below 9.6V'],
    fix_path: 'Install a keep-alive capacitor or small dedicated electronics battery. Ensure electronics are grounded to a clean DC negative bus, not the engine block. Upgrade battery if voltage collapses below 9V during crank.',
    escalate_if: 'Electronics reset randomly while underway (not just at start) — intermittent wiring fault.',
    parts: ['marine electronics capacitor keep-alive', 'DC negative bus bar marine', 'AGM marine battery upgrade'],
    tags: ['reboot', 'reset', 'cranking', 'voltage-drop', 'ground', 'power']
  }

];

/**
 * Retrieve the most relevant KB entries for a given query.
 * Simple keyword match — in production, replace with vector similarity search.
 */
function retrieveKnowledge(query, system = null, limit = 5) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 3);

  let entries = system
    ? KNOWLEDGE_BASE.filter(e => e.system === system)
    : KNOWLEDGE_BASE;

  const scored = entries.map(entry => {
    const searchText = [
      entry.symptom,
      entry.system,
      ...entry.likely_causes,
      ...entry.tags,
      ...entry.checks
    ].join(' ').toLowerCase();

    const score = words.reduce((acc, word) => {
      return acc + (searchText.includes(word) ? 1 : 0);
    }, 0);

    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

module.exports = { KNOWLEDGE_BASE, retrieveKnowledge };
