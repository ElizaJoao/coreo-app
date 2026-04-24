"use client";

import { useRef, useEffect } from "react";

export type AnimType =
  | "bounce"
  | "march"
  | "jump"
  | "kick"
  | "wave"
  | "sidestep"
  | "squat"
  | "spin";

export function detectAnimType(name: string): AnimType {
  const n = name.toLowerCase();
  if (/spin|turn|pirouette|twirl|rotat/.test(n)) return "spin";
  if (/jump|hop|leap|plyometric/.test(n)) return "jump";
  if (/kick/.test(n)) return "kick";
  if (/wave/.test(n)) return "wave";
  if (/squat|lunge|crouch|bend|low/.test(n)) return "squat";
  if (/grapevine|lateral|side.?step|cha.?cha|mambo|shuffle|tap|touch/.test(n)) return "sidestep";
  if (/march|walk|step|high.?knee/.test(n)) return "march";
  return "bounce";
}

type V = { x: number; y: number };

// Base joint positions in 200×300 viewBox
const B = {
  headCx: 100, headCy: 44,
  lShoulder: { x: 77,  y: 76  },
  rShoulder: { x: 123, y: 76  },
  lElbow:    { x: 64,  y: 112 },
  rElbow:    { x: 136, y: 112 },
  lHand:     { x: 57,  y: 148 },
  rHand:     { x: 143, y: 148 },
  lHip:      { x: 88,  y: 156 },
  rHip:      { x: 112, y: 156 },
  lKnee:     { x: 83,  y: 210 },
  rKnee:     { x: 117, y: 210 },
  lFoot:     { x: 78,  y: 264 },
  rFoot:     { x: 122, y: 264 },
};

type Skel = {
  headCx: number; headCy: number;
  lShoulder: V; rShoulder: V;
  lHip: V; rHip: V;
  lElbow: V; rElbow: V;
  lHand: V; rHand: V;
  lKnee: V; rKnee: V;
  lFoot: V; rFoot: V;
};

function computeSkeleton(phase: number, animType: AnimType): Skel {
  const s = Math.sin(phase);
  const c = Math.cos(phase);

  let bx = 0, by = 0;
  let dlS: V = { x: 0, y: 0 }, drS: V = { x: 0, y: 0 };
  let dlE: V = { x: 0, y: 0 }, drE: V = { x: 0, y: 0 };
  let dlH: V = { x: 0, y: 0 }, drH: V = { x: 0, y: 0 };
  let dlHp: V = { x: 0, y: 0 }, drHp: V = { x: 0, y: 0 };
  let dlK: V = { x: 0, y: 0 }, drK: V = { x: 0, y: 0 };
  let dlF: V = { x: 0, y: 0 }, drF: V = { x: 0, y: 0 };
  const dHead: V = { x: 0, y: 0 };

  switch (animType) {
    case "bounce": {
      by = s * 8;
      dlE = { x: s * 10,  y: -s * 7 };
      drE = { x: -s * 10, y:  s * 7 };
      dlH = { x: s * 16,  y: -s * 11 };
      drH = { x: -s * 16, y:  s * 11 };
      dlK = { x: -Math.abs(s) * 2, y: Math.abs(s) * 4 };
      drK = { x:  Math.abs(s) * 2, y: Math.abs(s) * 4 };
      break;
    }

    case "march": {
      by = Math.abs(s) * 4;
      const lLeg = Math.max(0, s);
      const rLeg = Math.max(0, -s);
      dlK = { x:  s * 4, y: -lLeg * 50 };
      dlF = { x:  s * 6, y: -lLeg * 62 };
      drK = { x: -s * 4, y: -rLeg * 50 };
      drF = { x: -s * 6, y: -rLeg * 62 };
      dlE = { x: -s * 7, y:  s * 22 };
      dlH = { x: -s * 9, y:  s * 32 };
      drE = { x:  s * 7, y: -s * 22 };
      drH = { x:  s * 9, y: -s * 32 };
      break;
    }

    case "jump": {
      const air = Math.max(0, s);
      by = -air * 34;
      dlK = { x: -air * 14, y: -air * 30 };
      drK = { x:  air * 14, y: -air * 30 };
      dlF = { x: -air * 12, y: -air * 40 };
      drF = { x:  air * 12, y: -air * 40 };
      dlE = { x: -air * 14, y: -air * 36 };
      drE = { x:  air * 14, y: -air * 36 };
      dlH = { x: -air * 12, y: -air * 52 };
      drH = { x:  air * 12, y: -air * 52 };
      if (s < -0.4) {
        const land = (-s - 0.4) * 1.67;
        dlK = { x: -land * 6, y: land * 14 };
        drK = { x:  land * 6, y: land * 14 };
      }
      break;
    }

    case "kick": {
      const kick = (1 + s) / 2;
      drK = { x: kick * 24,  y: -kick * 52 };
      drF = { x: kick * 46,  y: -kick * 90 };
      by = -kick * 7;
      bx =  kick * 3;
      dlE = { x: -kick * 10, y: -kick * 26 };
      dlH = { x: -kick * 12, y: -kick * 38 };
      drE = { x: -kick * 12, y:  kick * 14 };
      drH = { x: -kick * 18, y:  kick * 22 };
      break;
    }

    case "wave": {
      bx = s * 6;
      dlE  = { x: -14 + s * 12, y: -30 + c * 9  };
      dlH  = { x: -17 + s * 16, y: -62 + c * 14 };
      dlHp = { x: s * 4, y: 0 };
      drHp = { x: s * 4, y: 0 };
      dlK  = { x: s * 4, y: 0 };
      drK  = { x: s * 4, y: 0 };
      dlF  = { x: s * 3, y: 0 };
      drF  = { x: s * 3, y: 0 };
      break;
    }

    case "sidestep": {
      bx = s * 20;
      dlK  = { x: s * 10, y: Math.abs(s) * 5 };
      dlF  = { x: s * 12, y: 0 };
      drK  = { x: s * 6,  y: Math.abs(s) * 5 };
      drF  = { x: s * 7,  y: 0 };
      dlE  = { x: s * 7,  y: 0 };
      dlH  = { x: s * 10, y: 0 };
      drE  = { x: s * 7,  y: 0 };
      drH  = { x: s * 10, y: 0 };
      dlS  = { x: s * 4,  y: 0 };
      drS  = { x: s * 4,  y: 0 };
      dlHp = { x: -s * 3, y: 0 };
      drHp = { x: -s * 3, y: 0 };
      break;
    }

    case "squat": {
      const sq = (1 - c) / 2;
      by = sq * 40;
      dlK  = { x: -sq * 18, y: -sq * 14 };
      drK  = { x:  sq * 18, y: -sq * 14 };
      dlF  = { x: -sq * 12, y: 0 };
      drF  = { x:  sq * 12, y: 0 };
      dlE  = { x: -sq * 12, y: -sq * 16 };
      drE  = { x:  sq * 12, y: -sq * 16 };
      dlH  = { x: -sq * 22, y: -sq * 22 };
      drH  = { x:  sq * 22, y: -sq * 22 };
      break;
    }

    case "spin": {
      const spin = Math.abs(s);
      dlS  = { x:  spin * 20, y: 0 };
      drS  = { x: -spin * 20, y: 0 };
      dlHp = { x:  spin * 10, y: 0 };
      drHp = { x: -spin * 10, y: 0 };
      dlE  = { x: -spin * 26, y: -spin * 16 };
      drE  = { x:  spin * 26, y: -spin * 16 };
      dlH  = { x: -spin * 40, y: -spin * 22 };
      drH  = { x:  spin * 40, y: -spin * 22 };
      by   = -spin * 10;
      break;
    }
  }

  const J = (base: V, d: V): V => ({
    x: base.x + d.x + bx,
    y: base.y + d.y + by,
  });

  return {
    headCx:    B.headCx + dHead.x + bx,
    headCy:    B.headCy + dHead.y + by,
    lShoulder: J(B.lShoulder, dlS),
    rShoulder: J(B.rShoulder, drS),
    lHip:      J(B.lHip,  dlHp),
    rHip:      J(B.rHip,  drHp),
    lElbow:    J(B.lElbow, dlE),
    rElbow:    J(B.rElbow, drE),
    lHand:     J(B.lHand, dlH),
    rHand:     J(B.rHand, drH),
    lKnee:     J(B.lKnee, dlK),
    rKnee:     J(B.rKnee, drK),
    lFoot:     J(B.lFoot, dlF),
    rFoot:     J(B.rFoot, drF),
  };
}

const C_SKIN   = "#ECBA8C";
const C_HAIR   = "#1C0A06";
const C_SHIRT  = "#E8DDD0";
const C_PANTS  = "#3D4A5C";
const C_SHOES  = "#18202E";
const C_SKIN_B  = "rgba(210,158,108,0.6)";
const C_SHIRT_B = "rgba(180,168,148,0.6)";
const C_PANTS_B = "rgba(48,62,82,0.6)";
const C_SHOES_B = "rgba(22,28,44,0.6)";

type ElemCache = Partial<Record<string, SVGElement>>;

function sa(e: SVGElement | undefined, attrs: Record<string, string | number>) {
  if (!e) return;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
}

function p2(arr: V[]): string {
  return arr.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ");
}

const EL_IDS = [
  "r-uarm", "r-farm", "r-thigh", "r-calf",
  "torso", "neck",
  "l-uarm", "l-farm", "l-thigh", "l-calf",
  "head", "hair", "eye-l", "eye-r",
];

function updateSVG(elems: ElemCache, sk: Skel) {
  const neckX = (sk.lShoulder.x + sk.rShoulder.x) / 2;
  const neckY = (sk.lShoulder.y + sk.rShoulder.y) / 2;

  sa(elems["r-uarm"],  { x1: sk.rShoulder.x, y1: sk.rShoulder.y, x2: sk.rElbow.x, y2: sk.rElbow.y });
  sa(elems["r-farm"],  { x1: sk.rElbow.x,    y1: sk.rElbow.y,    x2: sk.rHand.x,  y2: sk.rHand.y  });
  sa(elems["r-thigh"], { x1: sk.rHip.x,  y1: sk.rHip.y,  x2: sk.rKnee.x, y2: sk.rKnee.y });
  sa(elems["r-calf"],  { x1: sk.rKnee.x, y1: sk.rKnee.y, x2: sk.rFoot.x, y2: sk.rFoot.y });
  sa(elems["torso"],   { points: p2([sk.lShoulder, sk.rShoulder, sk.rHip, sk.lHip]) });
  sa(elems["neck"],    { x1: sk.headCx, y1: sk.headCy + 19, x2: neckX, y2: neckY });
  sa(elems["l-uarm"],  { x1: sk.lShoulder.x, y1: sk.lShoulder.y, x2: sk.lElbow.x, y2: sk.lElbow.y });
  sa(elems["l-farm"],  { x1: sk.lElbow.x,    y1: sk.lElbow.y,    x2: sk.lHand.x,  y2: sk.lHand.y  });
  sa(elems["l-thigh"], { x1: sk.lHip.x,  y1: sk.lHip.y,  x2: sk.lKnee.x, y2: sk.lKnee.y });
  sa(elems["l-calf"],  { x1: sk.lKnee.x, y1: sk.lKnee.y, x2: sk.lFoot.x, y2: sk.lFoot.y });
  sa(elems["head"],    { cx: sk.headCx, cy: sk.headCy });
  sa(elems["hair"],    { cx: sk.headCx, cy: sk.headCy - 6 });
  sa(elems["eye-l"],   { cx: sk.headCx - 6, cy: sk.headCy - 1 });
  sa(elems["eye-r"],   { cx: sk.headCx + 6, cy: sk.headCy - 1 });
}

type Props = {
  moveName: string;
  bpm?: number;
  className?: string;
};

export function StickFigureCanvas({ moveName, bpm, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const elemsRef = useRef<ElemCache>({});
  const animType = detectAnimType(moveName);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const elems = elemsRef.current;
    for (const id of EL_IDS) {
      const el = svg.querySelector<SVGElement>(`[data-sf="${id}"]`);
      if (el) elems[id] = el;
    }

    const bps = ((bpm ?? 120) / 60) * Math.PI * 2;
    const start = performance.now();
    let rafId = 0;

    function frame(now: number) {
      const phase = ((now - start) / 1000) * bps;
      updateSVG(elems, computeSkeleton(phase, animType));
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [animType, bpm]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="278" rx="40" ry="7" fill="rgba(0,0,0,0.13)" />

      {/* Right (back) arm — muted */}
      <line data-sf="r-uarm"
        x1={B.rShoulder.x} y1={B.rShoulder.y} x2={B.rElbow.x} y2={B.rElbow.y}
        stroke={C_SHIRT_B} strokeWidth="9" strokeLinecap="round"
      />
      <line data-sf="r-farm"
        x1={B.rElbow.x} y1={B.rElbow.y} x2={B.rHand.x} y2={B.rHand.y}
        stroke={C_SKIN_B} strokeWidth="7" strokeLinecap="round"
      />

      {/* Right (back) leg — muted */}
      <line data-sf="r-thigh"
        x1={B.rHip.x} y1={B.rHip.y} x2={B.rKnee.x} y2={B.rKnee.y}
        stroke={C_PANTS_B} strokeWidth="13" strokeLinecap="round"
      />
      <line data-sf="r-calf"
        x1={B.rKnee.x} y1={B.rKnee.y} x2={B.rFoot.x} y2={B.rFoot.y}
        stroke={C_SHOES_B} strokeWidth="10" strokeLinecap="round"
      />

      {/* Torso */}
      <polygon data-sf="torso"
        points={p2([B.lShoulder, B.rShoulder, B.rHip, B.lHip])}
        fill={C_SHIRT}
      />

      {/* Neck */}
      <line data-sf="neck"
        x1={B.headCx} y1={B.headCy + 19}
        x2={(B.lShoulder.x + B.rShoulder.x) / 2}
        y2={(B.lShoulder.y + B.rShoulder.y) / 2}
        stroke={C_SKIN} strokeWidth="8" strokeLinecap="round"
      />

      {/* Left (front) arm */}
      <line data-sf="l-uarm"
        x1={B.lShoulder.x} y1={B.lShoulder.y} x2={B.lElbow.x} y2={B.lElbow.y}
        stroke={C_SHIRT} strokeWidth="9" strokeLinecap="round"
      />
      <line data-sf="l-farm"
        x1={B.lElbow.x} y1={B.lElbow.y} x2={B.lHand.x} y2={B.lHand.y}
        stroke={C_SKIN} strokeWidth="7" strokeLinecap="round"
      />

      {/* Left (front) leg */}
      <line data-sf="l-thigh"
        x1={B.lHip.x} y1={B.lHip.y} x2={B.lKnee.x} y2={B.lKnee.y}
        stroke={C_PANTS} strokeWidth="13" strokeLinecap="round"
      />
      <line data-sf="l-calf"
        x1={B.lKnee.x} y1={B.lKnee.y} x2={B.lFoot.x} y2={B.lFoot.y}
        stroke={C_SHOES} strokeWidth="10" strokeLinecap="round"
      />

      {/* Head */}
      <circle data-sf="head" cx={B.headCx} cy={B.headCy} r="19" fill={C_SKIN} />
      <ellipse data-sf="hair" cx={B.headCx} cy={B.headCy - 6} rx="19" ry="12" fill={C_HAIR} />
      <circle data-sf="eye-l" cx={B.headCx - 6} cy={B.headCy - 1} r="3" fill="#1a1a1a" />
      <circle data-sf="eye-r" cx={B.headCx + 6} cy={B.headCy - 1} r="3" fill="#1a1a1a" />
    </svg>
  );
}
