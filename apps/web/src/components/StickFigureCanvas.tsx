"use client";

import { useEffect, useRef, useState } from "react";

// ─── Design space ────────────────────────────────────────────────────────────
const DW = 280;
const DH = 440;
const HR = 24; // head radius

// ─── Types ───────────────────────────────────────────────────────────────────
type V = { x: number; y: number };
type Skel = {
  head: V;
  lShoulder: V; rShoulder: V;
  lElbow: V;    rElbow: V;
  lHand: V;     rHand: V;
  lHip: V;      rHip: V;
  lKnee: V;     rKnee: V;
  lFoot: V;     rFoot: V;
};
type AnimType = "bounce" | "march" | "jump" | "kick" | "wave" | "sidestep" | "squat" | "spin";

// ─── Neutral standing pose ────────────────────────────────────────────────────
const REST: Skel = {
  head:      { x: 140, y: 52  },
  lShoulder: { x: 100, y: 102 }, rShoulder: { x: 180, y: 102 },
  lElbow:    { x: 78,  y: 158 }, rElbow:    { x: 202, y: 158 },
  lHand:     { x: 68,  y: 212 }, rHand:     { x: 212, y: 212 },
  lHip:      { x: 116, y: 218 }, rHip:      { x: 164, y: 218 },
  lKnee:     { x: 108, y: 305 }, rKnee:     { x: 172, y: 305 },
  lFoot:     { x: 100, y: 392 }, rFoot:     { x: 180, y: 392 },
};

// ─── Animation type detection ─────────────────────────────────────────────────
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

// ─── Skeleton computation ─────────────────────────────────────────────────────
function computeSkeleton(phase: number, type: AnimType): Skel {
  const sw = Math.sin(phase);
  const cw = Math.cos(phase);
  const ab = Math.abs;

  // Global body offset (applied to every joint via P helper)
  let bx = 0, by = 0;
  switch (type) {
    case "bounce":   by = sw * 12; break;
    case "march":    by = sw * 8;  break;
    case "jump":     by = -ab(sw) * 64; break;
    case "kick":     by = cw * 7;  break;
    case "wave":     by = cw * 8;  break;
    case "sidestep": bx = sw * 50; by = -ab(sw) * 8; break;
    case "squat":    by = ab(sw) * 54; break;
    case "spin":     bx = Math.sin(phase * 0.5) * 16; break;
  }

  // Helper: REST joint + body offset + per-joint delta
  const P = (k: keyof Skel, dx = 0, dy = 0): V => ({
    x: REST[k].x + bx + dx,
    y: REST[k].y + by + dy,
  });

  // Build with body offset applied everywhere
  const s: Skel = {
    head:      P("head"),
    lShoulder: P("lShoulder"), rShoulder: P("rShoulder"),
    lElbow:    P("lElbow"),    rElbow:    P("rElbow"),
    lHand:     P("lHand"),     rHand:     P("rHand"),
    lHip:      P("lHip"),      rHip:      P("rHip"),
    lKnee:     P("lKnee"),     rKnee:     P("rKnee"),
    lFoot:     P("lFoot"),     rFoot:     P("rFoot"),
  };

  // Per-type individual joint adjustments
  switch (type) {
    case "bounce": {
      s.lElbow = P("lElbow",  sw * 18, -ab(sw) * 14);
      s.lHand  = P("lHand",   sw * 22, -ab(sw) * 22);
      s.rElbow = P("rElbow", -sw * 18, -ab(sw) * 14);
      s.rHand  = P("rHand",  -sw * 22, -ab(sw) * 22);
      s.lKnee  = P("lKnee",  sw * 12);
      s.lFoot  = P("lFoot",  sw * 14);
      s.rKnee  = P("rKnee", -sw * 12);
      s.rFoot  = P("rFoot", -sw * 14);
      break;
    }
    case "march": {
      // Arms swing counter to legs
      s.lElbow = P("lElbow", -sw * 28, -ab(sw) * 22);
      s.lHand  = P("lHand",  -sw * 34, -ab(sw) * 30);
      s.rElbow = P("rElbow",  sw * 28, -ab(sw) * 22);
      s.rHand  = P("rHand",   sw * 34, -ab(sw) * 30);
      // High knees alternate
      const lk = Math.max(0, sw);
      const rk = Math.max(0, -sw);
      s.lKnee  = P("lKnee",  -lk * 8,  -lk * 92);
      s.lFoot  = P("lFoot",  -lk * 12, -lk * 124);
      s.rKnee  = P("rKnee",   rk * 8,  -rk * 92);
      s.rFoot  = P("rFoot",   rk * 12, -rk * 124);
      break;
    }
    case "jump": {
      const h = ab(sw);
      s.lElbow = P("lElbow", -h * 14, -h * 32);
      s.lHand  = P("lHand",  -h * 26, -h * 58);
      s.rElbow = P("rElbow",  h * 14, -h * 32);
      s.rHand  = P("rHand",   h * 26, -h * 58);
      s.lKnee  = P("lKnee",  -h * 20,  h * 16);
      s.lFoot  = P("lFoot",  -h * 26,  h * 12);
      s.rKnee  = P("rKnee",   h * 20,  h * 16);
      s.rFoot  = P("rFoot",   h * 26,  h * 12);
      break;
    }
    case "kick": {
      s.lElbow = P("lElbow", -cw * 22);
      s.lHand  = P("lHand",  -cw * 30);
      s.rElbow = P("rElbow",  cw * 22);
      s.rHand  = P("rHand",   cw * 30);
      if (Math.sin(phase * 0.5) >= 0) {
        s.lKnee = P("lKnee",  sw * 34, -ab(sw) * 52);
        s.lFoot = P("lFoot",  sw * 60, -ab(sw) * 108);
      } else {
        s.rKnee = P("rKnee", -sw * 34, -ab(sw) * 52);
        s.rFoot = P("rFoot", -sw * 60, -ab(sw) * 108);
      }
      break;
    }
    case "wave": {
      s.lElbow = P("lElbow",  sw * 34, -ab(sw) * 42);
      s.lHand  = P("lHand",   sw * 18, -ab(sw) * 84);
      s.rElbow = P("rElbow", -cw * 16, -ab(cw) * 10);
      s.rHand  = P("rHand",  -cw * 18, -ab(cw) * 20);
      s.lKnee  = P("lKnee",   sw * 10);
      s.lFoot  = P("lFoot",   sw * 12);
      s.rKnee  = P("rKnee",  -sw * 10);
      s.rFoot  = P("rFoot",  -sw * 12);
      break;
    }
    case "sidestep": {
      s.lElbow = P("lElbow", -sw * 14,  ab(sw) * 8);
      s.lHand  = P("lHand",  -sw * 16,  ab(sw) * 10);
      s.rElbow = P("rElbow",  sw * 14,  ab(sw) * 8);
      s.rHand  = P("rHand",   sw * 16,  ab(sw) * 10);
      break;
    }
    case "squat": {
      const d = ab(sw);
      s.lKnee  = P("lKnee",  -d * 28,  d * 14);
      s.rKnee  = P("rKnee",   d * 28,  d * 14);
      // Keep feet on the ground (cancel body vertical)
      s.lFoot  = P("lFoot",  -d * 8,  -by);
      s.rFoot  = P("rFoot",   d * 8,  -by);
      // Arms forward for balance
      s.lElbow = P("lElbow", -d * 26, -d * 20);
      s.lHand  = P("lHand",  -d * 40, -d * 32);
      s.rElbow = P("rElbow",  d * 26, -d * 20);
      s.rHand  = P("rHand",   d * 40, -d * 32);
      break;
    }
    case "spin": {
      const persp = ab(Math.cos(phase * 0.5));
      s.lElbow = P("lElbow", -(persp * 42 + 20), -16);
      s.lHand  = P("lHand",  -(persp * 58 + 28), -24);
      s.rElbow = P("rElbow",  (persp * 42 + 20), -16);
      s.rHand  = P("rHand",   (persp * 58 + 28), -24);
      s.lKnee  = P("lKnee",  sw * 10);
      s.lFoot  = P("lFoot",  sw * 12);
      s.rKnee  = P("rKnee", -sw * 10);
      s.rFoot  = P("rFoot", -sw * 12);
      break;
    }
  }
  return s;
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function seg(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  bx: number, by: number,
  w: number, color: string,
) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  ctx.save();
  ctx.translate((ax + bx) / 2, (ay + by) / 2);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-len / 2, -w / 2, len, w, w / 2);
  ctx.fill();
  ctx.restore();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ─── Character rendering ──────────────────────────────────────────────────────
const C_MAIN  = "#F5C842";          // front limbs, torso
const C_BACK  = "rgba(190,148,26,0.72)"; // back limbs (depth)
const C_JOINT = "#FFE070";          // joint circles
const C_SKIN  = "#F5D070";          // head

function drawCharacter(ctx: CanvasRenderingContext2D, s: Skel) {
  const neckX = (s.lShoulder.x + s.rShoulder.x) / 2;
  const neckY = (s.lShoulder.y + s.rShoulder.y) / 2;

  // ── Back limbs (right side, rendered behind torso) ──
  seg(ctx, s.rHip.x, s.rHip.y, s.rKnee.x, s.rKnee.y, 20, C_BACK);
  dot(ctx, s.rKnee.x, s.rKnee.y, 10, C_BACK);
  seg(ctx, s.rKnee.x, s.rKnee.y, s.rFoot.x, s.rFoot.y, 16, C_BACK);
  dot(ctx, s.rFoot.x, s.rFoot.y, 8, C_BACK);

  seg(ctx, s.rShoulder.x, s.rShoulder.y, s.rElbow.x, s.rElbow.y, 14, C_BACK);
  dot(ctx, s.rElbow.x, s.rElbow.y, 8, C_BACK);
  seg(ctx, s.rElbow.x, s.rElbow.y, s.rHand.x, s.rHand.y, 11, C_BACK);
  dot(ctx, s.rHand.x, s.rHand.y, 6, C_BACK);

  // ── Torso (trapezoid: wider at shoulders) ──
  ctx.beginPath();
  ctx.moveTo(s.lShoulder.x - 3, s.lShoulder.y);
  ctx.lineTo(s.rShoulder.x + 3, s.rShoulder.y);
  ctx.lineTo(s.rHip.x + 2, s.rHip.y);
  ctx.lineTo(s.lHip.x - 2, s.lHip.y);
  ctx.closePath();
  ctx.fillStyle = C_MAIN;
  ctx.fill();

  // Neck
  seg(ctx, neckX, neckY, s.head.x, s.head.y - HR + 4, 14, C_MAIN);

  // ── Front limbs (left side) ──
  seg(ctx, s.lHip.x, s.lHip.y, s.lKnee.x, s.lKnee.y, 22, C_MAIN);
  dot(ctx, s.lKnee.x, s.lKnee.y, 11, C_JOINT);
  seg(ctx, s.lKnee.x, s.lKnee.y, s.lFoot.x, s.lFoot.y, 17, C_MAIN);
  dot(ctx, s.lFoot.x, s.lFoot.y, 9, C_JOINT);

  seg(ctx, s.lShoulder.x, s.lShoulder.y, s.lElbow.x, s.lElbow.y, 15, C_MAIN);
  dot(ctx, s.lElbow.x, s.lElbow.y, 9, C_JOINT);
  seg(ctx, s.lElbow.x, s.lElbow.y, s.lHand.x, s.lHand.y, 12, C_MAIN);
  dot(ctx, s.lHand.x, s.lHand.y, 7, C_JOINT);

  // Shoulder + hip joints
  dot(ctx, s.lShoulder.x, s.lShoulder.y, 10, C_JOINT);
  dot(ctx, s.rShoulder.x, s.rShoulder.y, 9,  C_BACK);
  dot(ctx, s.lHip.x, s.lHip.y, 10, C_JOINT);
  dot(ctx, s.rHip.x, s.rHip.y,  9, C_BACK);

  // ── Head ──
  dot(ctx, s.head.x, s.head.y, HR, C_SKIN);
  // Eyes
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  dot(ctx, s.head.x - 8, s.head.y - 4, 3, "rgba(0,0,0,0.45)");
  dot(ctx, s.head.x + 8, s.head.y - 4, 3, "rgba(0,0,0,0.45)");
}

// ─── Frame draw ───────────────────────────────────────────────────────────────
function drawFrame(ctx: CanvasRenderingContext2D, phase: number, type: AnimType, cw: number, ch: number) {
  ctx.clearRect(0, 0, cw, ch);

  const scale = Math.min(cw / DW, ch / DH);
  const ox = (cw - DW * scale) / 2;
  const oy = (ch - DH * scale) / 2;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(DW / 2, DH - 18, 55, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245,200,66,0.09)";
  ctx.fill();

  drawCharacter(ctx, computeSkeleton(phase, type));
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────
export type StickFigureCanvasProps = {
  moveName: string;
  bpm?: number;
  className?: string;
};

export function StickFigureCanvas({ moveName, bpm = 120, className }: StickFigureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: DW, h: DH });
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const animType = detectAnimType(moveName);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0)
        setSize({ w: Math.round(width * dpr), h: Math.round(height * dpr) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const phase = elapsed * (bpm / 60) * Math.PI * 2;
      drawFrame(ctx!, phase, animType, canvas!.width, canvas!.height);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [animType, bpm, size]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
