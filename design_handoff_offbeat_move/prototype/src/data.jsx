// ============ MOCK DATA ============
// Based on Offbeat Move domain constants (coreo-app/constants/choreography.ts)

const DANCE_STYLES = [
  "Zumba", "Dance Hall", "Hip Hop", "Jazz", "Ballet", "Contemporary",
  "Salsa", "Bachata", "Kizomba", "Tango", "Flamenco", "Tap Dance",
  "Swing", "Breakdance", "K-Pop", "Afro Dance", "Belly Dance",
  "Pole Dance", "Aerial Dance", "Irish Dance", "Ballroom",
];

const FITNESS_STYLES = [
  "Power Jump", "Body Combat", "Body Pump", "Step", "Aerobics",
  "Hidroginástica", "Acqua Zumba", "Pilates", "Yoga", "Power Yoga",
  "Stretching", "Functional Training", "CrossFit", "Cardio Dance",
  "Bokwa", "Sh'Bam", "RPM", "Body Balance", "Tai Chi", "Capoeira",
  "Cheerleading", "Gymnastics",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [15, 30, 45, 60, 90];

// Deterministic pseudo-random for stable waveforms
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeWaveform(seed, count = 48) {
  const r = seededRand(seed);
  const bars = [];
  for (let i = 0; i < count; i++) {
    // Create an energetic shape with some peaks
    const base = 0.3 + r() * 0.5;
    const peak = Math.sin((i / count) * Math.PI * 3) * 0.3 + 0.5;
    const mix = (base * 0.5 + peak * 0.5);
    bars.push(Math.max(0.15, Math.min(0.98, mix + (r() - 0.5) * 0.2)));
  }
  return bars;
}

const CHOREOGRAPHIES = [
  {
    id: "c1",
    name: "Midnight Pulse",
    style: "Hip Hop",
    category: "Dance",
    duration: 45,
    difficulty: "Intermediate",
    targetAudience: "Late-night energy seekers",
    description: "A dusky, driving set that builds from groove to release. Leans heavy on body rolls and hard-hitting accents on the 2 and 4.",
    music: { title: "Pulse Theory", artist: "Kaya North", bpm: 112 },
    createdAt: "2026-04-16",
    lastUsed: "2d ago",
    plays: 14,
    moves: [
      { id: "m1", order: 1, name: "Warm-up groove", duration: 180, description: "Easy bounce, roll the shoulders. Establish the pocket.", tag: "warm-up" },
      { id: "m2", order: 2, name: "Box step variation", duration: 240, description: "4 counts forward, 4 back. Add a quarter-turn on the last beat.", tag: "core" },
      { id: "m3", order: 3, name: "Body roll sequence", duration: 300, description: "Down and up on 8. Snap arms on the final count.", tag: "core" },
      { id: "m4", order: 4, name: "Crossbody travel", duration: 240, description: "Step-together-step across the floor. Partner check.", tag: "core" },
      { id: "m5", order: 5, name: "Freeze + release", duration: 180, description: "Hold on 4, explode on 5. Add vocal cue.", tag: "accent" },
      { id: "m6", order: 6, name: "Drop + recover", duration: 300, description: "Half squat into bounce back. Watch knees.", tag: "core" },
      { id: "m7", order: 7, name: "Chorus choreography", duration: 420, description: "Full 32-count phrase. Teach, then run it twice.", tag: "peak" },
      { id: "m8", order: 8, name: "Breakdown — footwork", duration: 300, description: "Cross-behind, rock-step, pivot. Loose hips.", tag: "core" },
      { id: "m9", order: 9, name: "Crowd section", duration: 240, description: "Open up, big arms. Eye contact across room.", tag: "peak" },
      { id: "m10", order: 10, name: "Cool-down stretch", duration: 300, description: "Quad, hamstring, shoulder open. Breath of four.", tag: "cool-down" },
    ],
  },
  {
    id: "c2",
    name: "Sunrise Flow",
    style: "Power Yoga",
    category: "Fitness",
    duration: 30,
    difficulty: "Beginner",
    targetAudience: "Early-morning students",
    description: "A grounding, breath-led sequence. Opens tight hips from desk days.",
    music: { title: "Amber Room", artist: "Olafur Hale", bpm: 72 },
    createdAt: "2026-04-15",
    lastUsed: "Yesterday",
    plays: 23,
    moves: [
      { id: "m1", order: 1, name: "Seated breath", duration: 180, description: "Box breathing 4-4-4-4. Set intention.", tag: "warm-up" },
      { id: "m2", order: 2, name: "Cat-cow flow", duration: 240, description: "8 cycles. Articulate each vertebra.", tag: "core" },
      { id: "m3", order: 3, name: "Sun salutation A", duration: 360, description: "3 rounds. Match breath to movement.", tag: "core" },
      { id: "m4", order: 4, name: "Warrior series", duration: 420, description: "Warrior I → II → Reverse. Hold 5 breaths each.", tag: "peak" },
      { id: "m5", order: 5, name: "Pigeon hold", duration: 240, description: "2 min each side. Optional forward fold.", tag: "core" },
      { id: "m6", order: 6, name: "Bridge flow", duration: 180, description: "Lift on inhale, lower on exhale. 6 reps.", tag: "core" },
      { id: "m7", order: 7, name: "Savasana", duration: 180, description: "Final rest. Guided visualization.", tag: "cool-down" },
    ],
  },
  {
    id: "c3",
    name: "Havana Heat",
    style: "Salsa",
    category: "Dance",
    duration: 60,
    difficulty: "Advanced",
    targetAudience: "Experienced partner dancers",
    description: "High-tempo Cuban-style salsa with turn patterns and body isolation work.",
    music: { title: "Calle Ocho", artist: "Los del Mar", bpm: 184 },
    createdAt: "2026-04-13",
    lastUsed: "5d ago",
    plays: 8,
    moves: [
      { id: "m1", order: 1, name: "Basic step — on 1", duration: 240, description: "Review timing. Call counts aloud.", tag: "warm-up" },
      { id: "m2", order: 2, name: "Cross body lead", duration: 360, description: "Smooth transfer. Maintain frame.", tag: "core" },
      { id: "m3", order: 3, name: "Right turn → left turn", duration: 420, description: "Spot the wall. Spiral through torso.", tag: "core" },
      { id: "m4", order: 4, name: "Copa with shoulder", duration: 360, description: "Add styling on the free arm.", tag: "peak" },
      { id: "m5", order: 5, name: "Dile que no combo", duration: 480, description: "Full Cuban pattern into cross-body.", tag: "peak" },
      { id: "m6", order: 6, name: "Enchufla variations", duration: 540, description: "3 entry types. Rotate partners.", tag: "core" },
      { id: "m7", order: 7, name: "Shine — isolations", duration: 360, description: "Chest, hip, knee pops. Own the space.", tag: "peak" },
      { id: "m8", order: 8, name: "Social round", duration: 480, description: "Free dance to full track. Coach from edge.", tag: "peak" },
      { id: "m9", order: 9, name: "Stretch-down", duration: 360, description: "Hip flexors, calves, lat reach.", tag: "cool-down" },
    ],
  },
  {
    id: "c4",
    name: "Iron Circuit",
    style: "Body Pump",
    category: "Fitness",
    duration: 45,
    difficulty: "Intermediate",
    targetAudience: "Strength-focused regulars",
    description: "Barbell-based muscle endurance. Low weight, high rep, every major group.",
    music: { title: "Heavy Drop", artist: "Ferro", bpm: 128 },
    createdAt: "2026-04-11",
    lastUsed: "3d ago",
    plays: 31,
    moves: [
      { id: "m1", order: 1, name: "Warm-up track", duration: 300, description: "Dynamic. Squat, row, press prep.", tag: "warm-up" },
      { id: "m2", order: 2, name: "Squats — heavy", duration: 360, description: "60% weight. 4/4 tempo, pulses at end.", tag: "core" },
      { id: "m3", order: 3, name: "Chest track", duration: 360, description: "Bench press + flies. 3 sets.", tag: "core" },
      { id: "m4", order: 4, name: "Back track — rows", duration: 360, description: "Wide + narrow grip. Deadlift bridge.", tag: "core" },
      { id: "m5", order: 5, name: "Triceps + biceps", duration: 420, description: "Superset. Overhead, hammer, 21s.", tag: "peak" },
      { id: "m6", order: 6, name: "Lunges track", duration: 360, description: "Alternating, plate-loaded. Core tight.", tag: "peak" },
      { id: "m7", order: 7, name: "Shoulders", duration: 300, description: "Military press + lateral raise.", tag: "core" },
      { id: "m8", order: 8, name: "Core finisher", duration: 240, description: "Plank, dead bug, Russian twist.", tag: "peak" },
      { id: "m9", order: 9, name: "Cool-down", duration: 300, description: "Full-body stretch. Foam roll optional.", tag: "cool-down" },
    ],
  },
  {
    id: "c5",
    name: "K-Pop Arena",
    style: "K-Pop",
    category: "Dance",
    duration: 45,
    difficulty: "Intermediate",
    targetAudience: "Teen & young adult cohort",
    description: "Sharp, group-formation choreography. Teach the 16-count hook and two fill verses.",
    music: { title: "Neon Signal", artist: "VIVID", bpm: 128 },
    createdAt: "2026-04-09",
    lastUsed: "1w ago",
    plays: 19,
    moves: [
      { id: "m1", order: 1, name: "Cardio warm-up", duration: 240, description: "March, jack, step-touch. Pulse to BPM.", tag: "warm-up" },
      { id: "m2", order: 2, name: "Hook — 16 counts", duration: 420, description: "Point, clap, cross, pose. Camera-aware.", tag: "peak" },
      { id: "m3", order: 3, name: "Verse 1 blocks", duration: 360, description: "Arm waves into footwork shuffle.", tag: "core" },
      { id: "m4", order: 4, name: "Formation change", duration: 240, description: "V → line → diamond. Count the path.", tag: "core" },
      { id: "m5", order: 5, name: "Pre-chorus build", duration: 300, description: "Head isolation, shoulder snap.", tag: "core" },
      { id: "m6", order: 6, name: "Chorus + formation", duration: 420, description: "Full hook with position change.", tag: "peak" },
      { id: "m7", order: 7, name: "Bridge — solo moments", duration: 300, description: "Rotate through featured dancers.", tag: "peak" },
      { id: "m8", order: 8, name: "Final chorus — run it", duration: 360, description: "Full speed, no stops. Record it.", tag: "peak" },
      { id: "m9", order: 9, name: "Stretch + debrief", duration: 300, description: "Calf, quad, neck. 2-min Q&A.", tag: "cool-down" },
    ],
  },
  {
    id: "c6",
    name: "Afterburn",
    style: "CrossFit",
    category: "Fitness",
    duration: 30,
    difficulty: "Advanced",
    targetAudience: "High-intensity regulars",
    description: "AMRAP + EMOM hybrid. Short, brutal, metabolically punishing.",
    music: { title: "Black Box", artist: "NR-9", bpm: 140 },
    createdAt: "2026-04-06",
    lastUsed: "4d ago",
    plays: 11,
    moves: [
      { id: "m1", order: 1, name: "Mobility prep", duration: 240, description: "Hip opener, shoulder dislocate.", tag: "warm-up" },
      { id: "m2", order: 2, name: "EMOM — 8 rounds", duration: 480, description: "Burpee × 8, KB swing × 12.", tag: "peak" },
      { id: "m3", order: 3, name: "AMRAP — 12 min", duration: 720, description: "Box jump, push-up, V-up loop.", tag: "peak" },
      { id: "m4", order: 4, name: "Finisher — rower", duration: 180, description: "500m all-out. Coach the stroke.", tag: "peak" },
      { id: "m5", order: 5, name: "Cool-down walk", duration: 180, description: "Drop HR. Breath control.", tag: "cool-down" },
    ],
  },
];

// Build waveforms per choreo
CHOREOGRAPHIES.forEach((c, i) => {
  c.waveform = makeWaveform(c.music.bpm * (i + 1), 56);
});

const STATS = {
  totalChoreos: CHOREOGRAPHIES.length,
  totalMinutes: CHOREOGRAPHIES.reduce((s, c) => s + c.duration, 0),
  avgBPM: Math.round(CHOREOGRAPHIES.reduce((s, c) => s + c.music.bpm, 0) / CHOREOGRAPHIES.length),
  classesThisWeek: 8,
};

const WEEK = [
  { day: "MON", num: 13, classes: [] },
  { day: "TUE", num: 14, classes: ["Sunrise Flow"] },
  { day: "WED", num: 15, classes: ["Iron Circuit", "Midnight Pulse"] },
  { day: "THU", num: 16, classes: ["K-Pop Arena"] },
  { day: "FRI", num: 17, classes: ["Havana Heat"] },
  { day: "SAT", num: 18, classes: ["Afterburn", "Sunrise Flow"] },
  { day: "SUN", num: 19, classes: [], isToday: true },
];

Object.assign(window, {
  DANCE_STYLES, FITNESS_STYLES, DIFFICULTIES, DURATIONS,
  CHOREOGRAPHIES, STATS, WEEK, makeWaveform, seededRand,
});
