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

