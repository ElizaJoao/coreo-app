"use client";

import { useEffect, useRef } from "react";

const W = 200;
const H = 260;
const CX = W / 2;

type AnimType = "bounce" | "jump" | "kick" | "wave" | "sidestep" | "squat" | "spin";

export function detectAnimType(name: string): AnimType {
  const n = name.toLowerCase();
  if (/spin|turn|pirouette|twirl|rotat/.test(n)) return "spin";
  if (/jump|hop|leap|plyometric/.test(n)) return "jump";
  if (/kick/.test(n)) return "kick";
  if (/wave/.test(n)) return "wave";
  if (/grapevine|lateral|side.?step/.test(n)) return "sidestep";
  if (/squat|crouch|bend|low/.test(n)) return "squat";
  return "bounce";
}

function drawFrame(ctx: CanvasRenderingContext2D, phase: number, type: AnimType) {
  ctx.clearRect(0, 0, W, H);

  const sw = Math.sin(phase);
  const cw = Math.cos(phase);

  let bx = CX;
  let by = 0;
  let rotation = 0;

  let lArmX = CX - 38, lArmY = 130;
  let rArmX = CX + 38, rArmY = 130;
  let lLegX = CX - 26, lLegY = 215;
  let rLegX = CX + 26, rLegY = 215;

  switch (type) {
    case "bounce":
      by = sw * 6;
      lArmX = CX - 38 + sw * 9; lArmY = 130 - Math.abs(sw) * 4;
      rArmX = CX + 38 - sw * 9; rArmY = 130 - Math.abs(sw) * 4;
      lLegX = CX - 26 + sw * 8;
      rLegX = CX + 26 - sw * 8;
      break;
    case "jump":
      by = -Math.abs(sw) * 24;
      lArmX = CX - 52 + sw * 6; lArmY = 108 + sw * 6;
      rArmX = CX + 52 - sw * 6; rArmY = 108 + sw * 6;
      lLegX = CX - 22 - Math.abs(sw) * 12; lLegY = 215 - Math.abs(sw) * 18;
      rLegX = CX + 22 + Math.abs(sw) * 12; rLegY = 215 - Math.abs(sw) * 18;
      break;
    case "kick":
      by = cw * 4;
      if (Math.sin(phase * 0.5) > 0) {
        lLegX = CX - 14 + sw * 32; lLegY = 200 - Math.abs(sw) * 28;
      } else {
        rLegX = CX + 14 - sw * 32; rLegY = 200 - Math.abs(sw) * 28;
      }
      break;
    case "wave":
      by = cw * 5;
      lArmX = CX - 26 + sw * 22; lArmY = 108 - Math.abs(sw) * 22;
      rArmX = CX + 52 - cw * 16; rArmY = 112 - Math.abs(cw) * 16;
      break;
    case "sidestep":
      bx = CX + sw * 20;
      lArmX = CX - 32 + sw * 20; rArmX = CX + 32 + sw * 20;
      lLegX = CX - 26 + sw * 20; rLegX = CX + 26 + sw * 20;
      break;
    case "squat":
      by = Math.abs(sw) * 20;
      lLegX = CX - 42 + sw * 5; lLegY = 215 - Math.abs(sw) * 5;
      rLegX = CX + 42 - sw * 5; rLegY = 215 - Math.abs(sw) * 5;
      break;
    case "spin":
      rotation = phase * 0.5;
      lArmX = CX - 46 + sw * 4; lArmY = 108;
      rArmX = CX + 46 + sw * 4; rArmY = 108;
      break;
  }

  const headCY = 60 + by;
  const headCX = bx;
  const headR = 16;
  const neckBotY = headCY + headR;
  const shoulderY = neckBotY + 10;
  const hipY = shoulderY + 65;

  ctx.save();
  if (rotation !== 0) {
    const pivotX = headCX;
    const pivotY = (shoulderY + hipY) / 2;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(rotation);
    ctx.translate(-pivotX, -pivotY);
  }

  ctx.strokeStyle = "#F5C842";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Ground shadow ellipse
  ctx.beginPath();
  ctx.ellipse(headCX, H - 18, 22, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245,200,66,0.07)";
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245,200,66,0.06)";
  ctx.fill();
  ctx.strokeStyle = "#F5C842";
  ctx.stroke();

  // Spine
  ctx.beginPath();
  ctx.moveTo(headCX, neckBotY);
  ctx.lineTo(headCX, hipY);
  ctx.strokeStyle = "#F5C842";
  ctx.stroke();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(headCX, shoulderY);
  ctx.lineTo(lArmX + (bx - CX), lArmY + by);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(headCX, shoulderY);
  ctx.lineTo(rArmX + (bx - CX), rArmY + by);
  ctx.stroke();

  // Left leg
  ctx.beginPath();
  ctx.moveTo(headCX, hipY);
  ctx.lineTo(lLegX + (bx - CX), lLegY + by);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(headCX, hipY);
  ctx.lineTo(rLegX + (bx - CX), rLegY + by);
  ctx.stroke();

  ctx.restore();
}

export type StickFigureCanvasProps = {
  moveName: string;
  bpm?: number;
  className?: string;
};

export function StickFigureCanvas({ moveName, bpm = 120, className }: StickFigureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const animType = detectAnimType(moveName);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const phase = elapsed * (bpm / 60) * Math.PI * 2;
      drawFrame(ctx!, phase, animType);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [animType, bpm]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={className}
    />
  );
}
