function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeWaveform(seed: number, count = 48): number[] {
  const r = seededRand(seed);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const base = 0.3 + r() * 0.5;
    const peak = Math.sin((i / count) * Math.PI * 3) * 0.3 + 0.5;
    const mix = base * 0.5 + peak * 0.5;
    bars.push(Math.max(0.15, Math.min(0.98, mix + (r() - 0.5) * 0.2)));
  }
  return bars;
}

export function fmtSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
