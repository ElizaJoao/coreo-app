export const DANCE_STYLES = [
  "Zumba",
  "Dance Hall",
  "Hip Hop",
  "Jazz",
  "Ballet",
  "Contemporary",
  "Salsa",
  "Bachata",
  "Kizomba",
  "Tango",
  "Flamenco",
  "Tap Dance",
  "Swing",
  "Breakdance",
  "K-Pop",
  "Afro Dance",
  "Belly Dance",
  "Pole Dance",
  "Aerial Dance",
  "Irish Dance",
  "Ballroom",
] as const;

export const FITNESS_STYLES = [
  "Power Jump",
  "Body Combat",
  "Body Pump",
  "Step",
  "Aerobics",
  "Hidroginástica",
  "Acqua Zumba",
  "Pilates",
  "Yoga",
  "Power Yoga",
  "Stretching",
  "Functional Training",
  "CrossFit",
  "Cardio Dance",
  "Bokwa",
  "Sh'Bam",
  "RPM",
  "Body Balance",
  "Tai Chi",
  "Capoeira",
  "Cheerleading",
  "Gymnastics",
] as const;

export const ALL_STYLES = [...DANCE_STYLES, ...FITNESS_STYLES] as const;

// Backward-compatible alias (prefer ALL_STYLES going forward).
export const STYLES = ALL_STYLES;

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const DURATIONS = [15, 30, 45, 60, 90] as const;

export type StyleContext = {
  bpmRange: [number, number];
  structure: string;
  vocabulary: string;
  language?: string;
};

export const STYLE_CONTEXT: Partial<Record<string, StyleContext>> = {
  // Dance styles
  "Zumba": {
    bpmRange: [100, 140],
    structure: "Alternate high-energy Latin songs (3–4 min each) with brief active recovery transitions. Begin with Merengue to warm up, end with a slower Cumbia or cool-down.",
    vocabulary: "Use Latin rhythm names: merengue, cumbia, salsa, reggaeton, cha-cha, mambo. Count in Spanish (uno, dos, tres). Standard cues: 'grapevine', 'mambo step', 'hip circle', 'suavemente', 'arriba!'.",
  },
  "Dance Hall": {
    bpmRange: [80, 110],
    structure: "Reggae/dancehall tracks 3–5 min each. Ground movements first, then build to jumps and turns. Cool down with slow riddim.",
    vocabulary: "Moves: butterfly, dutty wine, bogle, bruk out, wine. Cues: 'feel the riddim', 'drop low', 'forward/reverse', 'one time / two time'.",
  },
  "Hip Hop": {
    bpmRange: [80, 120],
    structure: "Freestyle blocks with 8-count phrases. Start with foundation grooves, add footwork and floor work, build to full combination.",
    vocabulary: "Foundation moves: top rock, 6-step, running man, cabbage patch, pop, lock, wave. Cues: '8-count', 'hit the beat', 'freeze', 'clean it up'.",
  },
  "Jazz": {
    bpmRange: [100, 160],
    structure: "Warm up with isolations and stretches, center work (tendus, kick combinations), across-the-floor, ending combination or performance piece.",
    vocabulary: "Jazz hands, chassé, fan kick, barrel turn, pas de bourrée, layout, back bend, split. Counts in 8s. Cues: 'elongate', 'jazz square', 'attitude'.",
  },
  "Ballet": {
    bpmRange: [60, 120],
    structure: "Barre (plié, tendu, dégagé, rond de jambe, fondu, frappé, adagio, grand battement) → center → adagio → turns → allegro → grand allegro.",
    vocabulary: "French terminology: plié, relevé, tendu, dégagé, arabesque, attitude, grand battement, pas de chat, pirouette, entrechat. Counts in 8s.",
  },
  "Contemporary": {
    bpmRange: [60, 130],
    structure: "Floor warm-up with spinal rolls and swings, standing center work with weight shifts, partnering or solo phrase, floor sequence, cooling down with release.",
    vocabulary: "Release technique, contraction, weight shift, suspension, fall and recover, spiral, contract-release, floor work. Cues: 'breathe through it', 'let the movement travel', 'initiate from the core'.",
  },
  "Salsa": {
    bpmRange: [160, 220],
    structure: "Basic steps in place, open work, turn patterns, shines (solo footwork), combination of turns and footwork, partner work if applicable.",
    vocabulary: "Basic step, cross-body lead, cumbia step, CBL, open break, inside/outside turn, copa, enchufla, dile que no. Count: 1-2-3 pause 5-6-7 pause.",
  },
  "Bachata": {
    bpmRange: [120, 160],
    structure: "Basic steps with side-to-side motion, turns, body waves, dips. Begin with Cuban-style basics, progress to sensual body rolls.",
    vocabulary: "Bachata basic, side step with tap, body roll, dip, open position, closed position. Cues: 'tap on 4', 'hip accent', 'lead from the frame'.",
  },
  "Kizomba": {
    bpmRange: [60, 90],
    structure: "Walking connection basics, then add stop-and-go, semba steps, leg traps, dips and turns. Slow, grounded and sensual.",
    vocabulary: "Saida, pastinha, entry, legwork, stop, angolo, semba bounce. Cues: 'walk the rhythm', 'listen to the bass', 'close the frame'.",
  },
  "Tango": {
    bpmRange: [60, 80],
    structure: "Embrace and walk, pauses, ochos (figure-8), molinete (turn), leg ornaments, gancho, volcada. Structure follows musical phrasing.",
    vocabulary: "Ocho, molinete, caminada, pausa, gancho, volcada, boleo, enrosque, sacada, vals tango, milonga. Cues: 'lead from the chest', 'collect before stepping'.",
  },
  "Flamenco": {
    bpmRange: [60, 180],
    structure: "Introduction (llamada), copla (main section), escobilla (footwork section), cierre (ending). Based on compás (rhythmic cycle).",
    vocabulary: "Zapateado (footwork), palmas (clapping), braceo (arm work), llamada, escobilla, remate, farruca, soleá, bulerías, sevillanas. Count by 12-beat compás.",
  },
  "Tap Dance": {
    bpmRange: [100, 220],
    structure: "Warm up with brushes and shuffles, time steps, across the floor with complex combinations, performance piece with improvisation breaks.",
    vocabulary: "Brush, flap, shuffle, ball change, cramproll, time step, stomp, toe stand, heel drop, riffle, treble. Cues: 'clean sounds', 'even tempo', 'listen to yourself'.",
  },
  "Swing": {
    bpmRange: [120, 200],
    structure: "6-count and 8-count basics, swing out, lindy circle, Charleston, aerials (for advanced). Follow the musical phrasing of big band jazz.",
    vocabulary: "Swing out, lindy circle, Charleston, triple step, rock step, send-out, come-around, tuck turn, Sugarfoot Charlie. Cues: 'pulse on the offbeat', 'lead with intention'.",
  },
  "Breakdance": {
    bpmRange: [80, 130],
    structure: "Top rock, down rock (go-down + footwork), power moves (freezes + windmill/headspins), freeze, and exit. Build intensity in the middle.",
    vocabulary: "Top rock, 6-step, 3-step, kick-outs, freeze, windmill, flare, headspin, backspin, L-kick, baby freeze. Cues: 'feel the groove first', 'hold the freeze'.",
  },
  "K-Pop": {
    bpmRange: [100, 150],
    structure: "Mirror current K-pop song structure: intro formation, verse groove, pre-chorus build, chorus point choreography, bridge breakdown, outro.",
    vocabulary: "Point move (signature move per chorus), formation change, level change, wave, isolations, sharp pops, synchronized arms. Counts in 8s. Cues: 'hit sharp', 'sync with everyone'.",
  },
  "Afro Dance": {
    bpmRange: [90, 140],
    structure: "Grounding and warm-up with bounces, basic Afrobeats step, build to combinations of Shaku Shaku, Zanku, Alanta, Lagos Big Boys. End with freestyle.",
    vocabulary: "Zanku, Shaku Shaku, Alanta, Gwara Gwara, Galala, Azonto. Cues: 'feel the polyrhythm', 'ground through the feet', 'call and response'.",
  },
  "Belly Dance": {
    bpmRange: [60, 140],
    structure: "Warm-up with hip circles and undulations, layering technique (isolate belly with arm/head movements simultaneously), veil or sword work, shimmy combinations, finale.",
    vocabulary: "Figure 8, hip drop, undulation, shimmy, maya, hip lift, snake arms, veil work, zill (finger cymbal) patterns. Cues: 'isolate the movement', 'float the arms'.",
  },
  "Irish Dance": {
    bpmRange: [100, 160],
    structure: "Soft shoe reel/slip jig first, then hard shoe hornpipe/jig. Bars of 8 with repeated phrases. Formations move forward, back, and cross.",
    vocabulary: "Sevens, threes, skip 2–3, hop back, treble jig, stamp, click, leap, side step. Cues: 'straight back', 'turnout', 'point the toes'.",
  },
  "Ballroom": {
    bpmRange: [28, 60],
    structure: "Standard (Waltz, Foxtrot, Quickstep, Tango, Viennese Waltz) or Latin (Cha-cha, Samba, Rumba, Paso Doble, Jive) format. Natural/reverse turns, progressions, quarter turns.",
    vocabulary: "International Style footwork: heel-toe, toe-heel. Waltz: natural turn, reverse turn, whisk, chasse. Latin: basic movement, volta, spot turn, alemana. Cues: 'ballroom hold', 'frame'.",
  },

  // Fitness styles
  "Power Jump": {
    bpmRange: [128, 145],
    structure: "Warm-up track, 3 base tracks (low impact introducing moves), 4–5 high intensity peak tracks (plyometric), 1 strength track, cool-down. Les Mills structure.",
    vocabulary: "Track names: Warmup, Base Moves, Base Moves 2, Base Moves 3, Peaks, Peak Power, Athletic Strength, Cool Down. Moves: jump squats, tuck jumps, power knees, jumping lunges.",
  },
  "Body Combat": {
    bpmRange: [130, 145],
    structure: "Warm-up, upper body combat (jabs, crosses, hooks), lower body (kicks), mixed martial arts peak, upper/lower power peak, cool-down. Les Mills structure.",
    vocabulary: "Jab, cross, hook, upper cut, front kick, side kick, roundhouse, knee strike, muay thai, capoeira, tai chi. Cue: 'power from the hips', 'exhale on impact'.",
  },
  "Body Pump": {
    bpmRange: [120, 140],
    structure: "10 tracks: warm-up with squat, legs, chest, back, triceps, biceps, lunges, shoulders, core, cool-down. Les Mills barbell format.",
    vocabulary: "Squat, clean and press, deadrow, snatch, press, curl, kickback, lunge, lateral raise, front raise, plate crunch. Tempo: singles, doubles, 3/1, 1/3.",
  },
  "Step": {
    bpmRange: [118, 132],
    structure: "Warm-up on floor, base step introduction, build layer by layer (add turns, kicks, arm variations), peak combination, cool-down stretch.",
    vocabulary: "Basic step, V-step, A-step, knee lift, kick, repeater, turn step, L-step, mambo, cha-cha over the top, straddle. Cues: 'lead foot', 'tap and change', '32-count block'.",
  },
  "Aerobics": {
    bpmRange: [130, 150],
    structure: "Warm-up (5 min), pre-aerobic phase (low impact), aerobic peak (20 min, high impact option), cool-down + stretch.",
    vocabulary: "Marching, grapevine, step touch, jumping jack, knee lift, heel dig, box step, V-step, pivot turn. Cue: '8-count phrases', 'impact option', 'low/high impact'.",
  },
  "Hidroginástica": {
    bpmRange: [120, 145],
    structure: "Aquatic warm-up walking in shallow water, cardiovascular phase with jumps and resistance moves, muscular strength phase, stretching in water.",
    vocabulary: "Portuguese terms: caminhada lateral (lateral walk), tesoura (scissors), chute frontal (front kick), remada (rowing), salto (jump), agachamento (squat), espaguete (pool noodle), halteres aquáticos (aqua dumbbells), prancha (kickboard). Cues in Portuguese.",
    language: "pt",
  },
  "Acqua Zumba": {
    bpmRange: [100, 130],
    structure: "Begin in shallow water with merengue march, alternate Latin rhythms (salsa, cumbia, reggaeton) with aquatic resistance variations, lower intensity ending.",
    vocabulary: "Same Latin rhythms as Zumba adapted for water: slower arm movements against resistance, exaggerated hip movements, jumps with soft landings. Pool noodle optional.",
    language: "pt",
  },
  "Pilates": {
    bpmRange: [60, 90],
    structure: "Mat Pilates: warm-up (breathing, pelvic tilt), series of five (hundred, roll-up, single/double leg stretch, criss-cross, straight leg stretch), side-lying, back extension, cool-down.",
    vocabulary: "Neutral spine, imprinting, scoop, powerhouse, C-curve, articulation, hundred, roll-up, teaser, swan, side kick series. Cues: 'navel to spine', 'elongate', 'articulate each vertebra'.",
  },
  "Yoga": {
    bpmRange: [40, 70],
    structure: "Opening centering and pranayama (breathing), warm-up (Cat-Cow, Child's Pose), standing sequence (Sun Salutation), peak poses, cool-down (seated/supine), Savasana.",
    vocabulary: "Sanskrit pose names: Tadasana, Adho Mukha Svanasana (Downward Dog), Virabhadrasana (Warrior), Trikonasana (Triangle), Chaturanga, Urdhva Mukha Svanasana. Cues: 'root down to rise', 'breathe into the stretch'.",
  },
  "Power Yoga": {
    bpmRange: [80, 110],
    structure: "Vigorous Sun Salutations A and B to warm up, standing balance and strength sequences, inversions (wheel, headstand), cool-down Yin poses, Savasana.",
    vocabulary: "Same as Yoga but faster-paced. Add: Chaturanga, plank, side plank (Vasisthasana), handstand prep, Bakasana (crow). Cues: 'find your edge', 'heat the body', 'vinyasa'.",
  },
  "Stretching": {
    bpmRange: [40, 70],
    structure: "Active warm-up (joint circles, dynamic swings), static stretching major muscle groups (30–60 seconds per stretch), PNF or partner stretching for advanced, relaxation.",
    vocabulary: "Hold each stretch 30–60 seconds. Target: hamstrings, hip flexors, quads, calves, chest, lats, shoulders. Cues: 'breathe out into the stretch', 'no bouncing', 'find tension, not pain'.",
  },
  "Functional Training": {
    bpmRange: [90, 130],
    structure: "Mobility warm-up, compound movement blocks (push/pull/hinge/squat/carry/rotate), HIIT or circuit format, cool-down mobility.",
    vocabulary: "Squat, deadlift, hip hinge, push-up, row, plank, farmer carry, pallof press, Turkish get-up, kettlebell swing. Cues: 'brace the core', 'hinge at the hip', 'neutral spine'.",
  },
  "CrossFit": {
    bpmRange: [100, 160],
    structure: "Warm-up (dynamic + gymnastics skill), strength or skill work (15–20 min), WOD (Workout of the Day: AMRAP / For Time / EMOM), cool-down and mobility.",
    vocabulary: "WOD, AMRAP, EMOM, For Time, Rx, scaled, box jump, burpee, double-under, kipping, clean, snatch, thruster, wall ball, toes-to-bar. Cues: 'three, two, one, go', 'full range of motion'.",
  },
  "Cardio Dance": {
    bpmRange: [125, 145],
    structure: "Easy step warm-up, build to full combinations in 8-count blocks, peak intensity 10–15 min, cool-down. Mix popular music genres.",
    vocabulary: "Grapevine, mambo, cha-cha, kick-ball-change, hip roll, step-touch, pivot turn. Cues: '5-6-7-8', 'and a 1-2-3', 'add the arms'.",
  },
  "Bokwa": {
    bpmRange: [128, 138],
    structure: "Bokwa is letter and number-based: moves draw the shapes of A, E, 4, L etc. with footwork. Teach each letter move, then chain them freestyle.",
    vocabulary: "Letter moves: 4-count base, A-move, L-move, C-move, 4-move, Jog-It, Box-It, Triangle, Straddle. Cues: 'draw the letter', 'stay in your box', 'freestyle'.",
  },
  "Sh'Bam": {
    bpmRange: [128, 138],
    structure: "Les Mills format: 45-min class with 8 tracks of popular music. Each track teaches a simple pop-dance routine: intro phrase, repeat and build, outro.",
    vocabulary: "Simple, fun pop-culture dance moves: finger guns, shoulder shimmy, hip sway, jump clap, circle step. Cues: 'no experience needed', 'big energy', 'smile!'.",
  },
  "RPM": {
    bpmRange: [60, 110],
    structure: "Indoor cycling: warm-up flat road, rolling hills, seated/standing climbs, sprints, peak interval, recovery, cool-down. Les Mills structure.",
    vocabulary: "Flat road, seated climb, standing climb, sprint, jump (seated-to-standing), hover (bent position), RPM (cadence), resistance (dial up/down). Cues: 'push through', 'find your rhythm', 'cadence check'.",
  },
  "Body Balance": {
    bpmRange: [60, 100],
    structure: "Tai Chi warm-up, Sun Salutations, standing strength series, balance poses, hip openers, core, Pilates-inspired cool-down, Savasana. Les Mills.",
    vocabulary: "Blend of Yoga, Tai Chi and Pilates. Warrior, Triangle, Eagle, Tree pose. Tai Chi: wave hands, cloud hands. Pilates: hundred, roll-up. Cues: 'centre and ground', 'flow between poses'.",
  },
  "Tai Chi": {
    bpmRange: [40, 60],
    structure: "Opening form (wu ji stance), series of Yang-style movements linked in continuous flowing sequence (24-form or 108-form), closing. Constant slow flow.",
    vocabulary: "Grasp Bird's Tail, Ward Off, Roll Back, Press, Push, Single Whip, Wave Hands Like Clouds, Brush Knee, Part the Wild Horse's Mane. Cues: 'silk reeling', 'qi flow', 'soft gaze'.",
  },
  "Capoeira": {
    bpmRange: [80, 140],
    structure: "Ginga (base movement) drill, attack and defense pairs (au, ginga, martelo, meia-lua), jogo (game play simulation), batizado-style roda finale.",
    vocabulary: "Ginga, au (cartwheel), esquiva (dodge), bênção (push kick), meia-lua de frente, martelo, queixada, rasteira, armada, giro. Berimbau instrument sets the rhythm and jogo pace.",
  },
  "Cheerleading": {
    bpmRange: [120, 160],
    structure: "Warm-up with jumps and flexibility, motion technique drill (sharp, clean positions), tumbling prep, pyramid and stunt intro, full routine run-through.",
    vocabulary: "High V, Low V, T-motion, L-motion, daggers, clap, clasp, spirit fingers, basket toss, cupie, liberty, herkie jump, toe touch, pike. Cues: 'sharp and clean', 'hit the counts', 'smile and project'.",
  },
  "Gymnastics": {
    bpmRange: [60, 130],
    structure: "Floor warm-up: rolls, handstands, cartwheels. Bars: kip, cast, back hip circle. Beam: walks, turns, leaps. Vault: approach and block. Conditioning at the end.",
    vocabulary: "Forward roll, backward roll, handstand, cartwheel, round-off, back walkover, front walkover, kip, glide swing, cast, back hip circle, straddle leap. Cues: 'hollow body', 'tight core', 'squeeze glutes'.",
  },
};

