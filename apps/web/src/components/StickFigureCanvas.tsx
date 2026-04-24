"use client";

import { useEffect, useRef, useState } from "react";

// Design-space dimensions — all coords in these units, then scaled to actual canvas
const DW = 280;
const DH = 400;
const DCX = DW / 2;

// Baseline joint positions at rest
const HR = 28;         // head radius
const HEAD_Y = 80;
const SHOULDER_Y = HEAD_Y + HR + 14;   // 122
const HIP_Y = SHOULDER_Y + 84;         // 206
const ARM_SPREAD = 56;
const ARM_TIP_Y = SHOULDER_Y + 64;     // 186
const LEG_SPREAD = 44;
const LEG_TIP_Y = HIP_Y + 118;        // 324

type AnimType = "bounce" | "march" | "jump" | "kick" | "wave" | "sidestep" | "squat" | "spin";

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

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  hx: number, hy: number,
  lAx: number, lAy: number,
  rAx: number, rAy: number,
  lLx: number, lLy: number,
  rLx: number, rLy: number,
) {
  const sy = hy + HR;
  const hipY = sy + 14 + 84;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(hx, DH - 24, 38, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245,200,66,0.1)";
  ctx.fill();

  // Legs (drawn first, behind body)
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#d4a520";
  ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(lLx, lLy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(rLx, rLy); ctx.stroke();

  // Feet (small filled circles)
  ctx.fillStyle = "#d4a520";
  ctx.beginPath(); ctx.arc(lLx, lLy, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rLx, rLy, 7, 0, Math.PI * 2); ctx.fill();

  // Torso (thicker middle section)
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#F5C842";
  ctx.beginPath();
  ctx.moveTo(hx, sy);
  ctx.lineTo(hx, hipY);
  ctx.stroke();

  // Arms
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#F5C842";
  ctx.beginPath(); ctx.moveTo(hx, sy + 14); ctx.lineTo(lAx, lAy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx, sy + 14); ctx.lineTo(rAx, rAy); ctx.stroke();

  // Hands
  ctx.fillStyle = "#F5C842";
  ctx.beginPath(); ctx.arc(lAx, lAy, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rAx, rAy, 5, 0, Math.PI * 2); ctx.fill();

  // Head (solid filled)
  ctx.beginPath();
  ctx.arc(hx, hy, HR, 0, Math.PI * 2);
  ctx.fillStyle = "#F5C842";
  ctx.fill();
}

function drawFrame(ctx: CanvasRenderingContext2D, phase: number, type: AnimType) {
  ctx.clearRect(0, 0, DW, DH);

  const sw = Math.sin(phase);
  const cw = Math.cos(phase);

  let hx = DCX, hy = HEAD_Y;
  let lAx = DCX - ARM_SPREAD, lAy = ARM_TIP_Y;
  let rAx = DCX + ARM_SPREAD, rAy = ARM_TIP_Y;
  let lLx = DCX - LEG_SPREAD, lLy = LEG_TIP_Y;
  let rLx = DCX + LEG_SPREAD, rLy = LEG_TIP_Y;

  switch (type) {

    case "bounce":
      hy += sw * 12;
      lAx = DCX - ARM_SPREAD + sw * 18; lAy = ARM_TIP_Y - Math.abs(sw) * 14;
      rAx = DCX + ARM_SPREAD - sw * 18; rAy = ARM_TIP_Y - Math.abs(sw) * 14;
      lLx = DCX - LEG_SPREAD + sw * 14;
      rLx = DCX + LEG_SPREAD - sw * 14;
      break;

    case "march": {
      hy += sw * 8;
      // Arms swing opposite to legs
      lAx = DCX - ARM_SPREAD - sw * 28; lAy = ARM_TIP_Y - 10 - Math.abs(sw) * 18;
      rAx = DCX + ARM_SPREAD + sw * 28; rAy = ARM_TIP_Y - 10 - Math.abs(sw) * 18;
      // High knees: left up when sw > 0, right up when sw < 0
      const lKnee = Math.max(0, sw);
      const rKnee = Math.max(0, -sw);
      lLx = DCX - LEG_SPREAD * 0.6;
      lLy = LEG_TIP_Y - lKnee * 100;
      rLx = DCX + LEG_SPREAD * 0.6;
      rLy = LEG_TIP_Y - rKnee * 100;
      break;
    }

    case "jump":
      hy -= Math.abs(sw) * 52;
      lAx = DCX - 72 + sw * 10; lAy = SHOULDER_Y + 32 + sw * 14;
      rAx = DCX + 72 - sw * 10; rAy = SHOULDER_Y + 32 + sw * 14;
      lLx = DCX - LEG_SPREAD - Math.abs(sw) * 24; lLy = LEG_TIP_Y - Math.abs(sw) * 48;
      rLx = DCX + LEG_SPREAD + Math.abs(sw) * 24; rLy = LEG_TIP_Y - Math.abs(sw) * 48;
      break;

    case "kick": {
      hy += cw * 7;
      lAx = DCX - ARM_SPREAD - cw * 18; lAy = ARM_TIP_Y;
      rAx = DCX + ARM_SPREAD + cw * 18; rAy = ARM_TIP_Y;
      const leftKicking = Math.sin(phase * 0.5) >= 0;
      if (leftKicking) {
        lLx = DCX - LEG_SPREAD * 0.3 + sw * 50;
        lLy = LEG_TIP_Y - Math.abs(sw) * 105;
      } else {
        rLx = DCX + LEG_SPREAD * 0.3 - sw * 50;
        rLy = LEG_TIP_Y - Math.abs(sw) * 105;
      }
      break;
    }

    case "wave":
      hy += cw * 9;
      // Left arm waves overhead, right stays lower
      lAx = DCX - ARM_SPREAD + sw * 35; lAy = ARM_TIP_Y - Math.abs(sw) * 70;
      rAx = DCX + ARM_SPREAD - cw * 22; rAy = ARM_TIP_Y - Math.abs(cw) * 28;
      lLx = DCX - LEG_SPREAD + sw * 12;
      rLx = DCX + LEG_SPREAD - sw * 12;
      break;

    case "sidestep": {
      const shift = sw * 55;
      hx = DCX + shift;
      lAx = DCX - ARM_SPREAD + shift - sw * 12;
      rAx = DCX + ARM_SPREAD + shift + sw * 12;
      lAy = ARM_TIP_Y + Math.abs(sw) * 10;
      rAy = ARM_TIP_Y + Math.abs(sw) * 10;
      lLx = DCX - LEG_SPREAD * 0.5 + shift;
      rLx = DCX + LEG_SPREAD * 0.5 + shift;
      // Feet stay closer together (step-touch style)
      break;
    }

    case "squat": {
      const depth = Math.abs(sw);
      hy += depth * 48;
      lAx = DCX - ARM_SPREAD - depth * 18; lAy = ARM_TIP_Y + depth * 24;
      rAx = DCX + ARM_SPREAD + depth * 18; rAy = ARM_TIP_Y + depth * 24;
      lLx = DCX - LEG_SPREAD - depth * 30; lLy = LEG_TIP_Y + depth * 12;
      rLx = DCX + LEG_SPREAD + depth * 30; rLy = LEG_TIP_Y + depth * 12;
      break;
    }

    case "spin": {
      // Perspective spin: figure appears to rotate in 3D
      const spinA = phase * 0.5;
      const persp = Math.cos(spinA);  // 1 = front, 0 = side, -1 = back
      const drift = Math.sin(spinA) * 20;
      hx = DCX + drift;
      // Arms spread collapses as figure turns side-on
      lAx = DCX - ARM_SPREAD * Math.abs(persp) + drift;
      rAx = DCX + ARM_SPREAD * Math.abs(persp) + drift;
      lAy = ARM_TIP_Y - 20 + sw * 8;
      rAy = ARM_TIP_Y - 20 - sw * 8;
      lLx = DCX - LEG_SPREAD * 0.7 + drift;
      rLx = DCX + LEG_SPREAD * 0.7 + drift;
      break;
    }
  }

  drawCharacter(ctx, hx, hy, lAx, lAy, rAx, rAy, lLx, lLy, rLx, rLy);
}

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

  // Track container size so canvas pixel buffer matches CSS display size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ w: Math.round(width * dpr), h: Math.round(height * dpr) });
      }
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

      const cw = canvas!.width;
      const ch = canvas!.height;

      // Scale design space to fill canvas while preserving aspect ratio
      const scale = Math.min(cw / DW, ch / DH);
      const ox = (cw - DW * scale) / 2;
      const oy = (ch - DH * scale) / 2;

      ctx!.clearRect(0, 0, cw, ch);
      ctx!.save();
      ctx!.translate(ox, oy);
      ctx!.scale(scale, scale);

      drawFrame(ctx!, phase, animType);

      ctx!.restore();
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
