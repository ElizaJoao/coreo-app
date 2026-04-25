"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./OnboardingSpotlight.module.css";

type Position = "top" | "bottom" | "left" | "right";

type TourStep = {
  selector: string;
  title: string;
  body: string;
  position: Position;
};

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  steps: TourStep[];
  step: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
};

const PAD = 8;
const TOOLTIP_W = 300;
const TOOLTIP_H = 180; // approximate, for top-position calculation

function getTooltipStyle(rect: Rect, position: Position): React.CSSProperties {
  const GAP = 18;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const clampLeft = (v: number) => Math.max(12, Math.min(v, window.innerWidth - TOOLTIP_W - 12));

  switch (position) {
    case "bottom":
      return {
        top: rect.top + rect.height + GAP,
        left: clampLeft(cx - TOOLTIP_W / 2),
        width: TOOLTIP_W,
      };
    case "top":
      return {
        top: Math.max(12, rect.top - TOOLTIP_H - GAP),
        left: clampLeft(cx - TOOLTIP_W / 2),
        width: TOOLTIP_W,
      };
    case "right":
      return {
        top: Math.max(12, cy - TOOLTIP_H / 2),
        left: Math.min(rect.left + rect.width + GAP, window.innerWidth - TOOLTIP_W - 12),
        width: TOOLTIP_W,
      };
    case "left":
      return {
        top: Math.max(12, cy - TOOLTIP_H / 2),
        left: Math.max(12, rect.left - TOOLTIP_W - GAP),
        width: TOOLTIP_W,
      };
  }
}

export function OnboardingSpotlight({ steps, step, total, onNext, onSkip }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const current = steps[step];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !current) return;
    setRect(null); // reset while finding new target

    let attempts = 0;
    function measure() {
      const el = document.querySelector(current.selector);
      if (!el) {
        if (attempts < 15) {
          attempts++;
          setTimeout(measure, 80);
        }
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    const id = setTimeout(measure, 60);
    return () => clearTimeout(id);
  }, [mounted, current, step]);

  if (!mounted || !current) return null;

  const isLast = step === total - 1;

  return createPortal(
    <div className={styles.root}>
      {/* Barrier: blocks page interaction during tour */}
      <div className={styles.barrier} />

      {/* Spotlight: transparent window with dark surround via box-shadow */}
      {rect && (
        <div
          className={styles.spotlight}
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}

      {/* Tooltip card */}
      {rect && (
        <div
          className={`${styles.tooltip} ${styles[`pos_${current.position}`]}`}
          style={getTooltipStyle(rect, current.position)}
        >
          <div className={styles.stepPip}>
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={i === step ? styles.pipActive : styles.pip}
              />
            ))}
          </div>
          <div className={styles.title}>{current.title}</div>
          <div className={styles.body}>{current.body}</div>
          <div className={styles.actions}>
            <button className={styles.skip} type="button" onClick={onSkip}>
              Skip tour
            </button>
            <button className={styles.next} type="button" onClick={onNext}>
              {isLast ? "Done ✓" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
