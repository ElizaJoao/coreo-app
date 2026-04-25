import styles from "./Skeleton.module.css";

type Props = {
  height?: number | string;
  width?: number | string;
  radius?: number | string;
  className?: string;
};

export function Skeleton({ height = 16, width = "100%", radius = 6, className }: Props) {
  return (
    <div
      className={`${styles.pulse} ${className ?? ""}`}
      style={{ height, width, borderRadius: radius }}
      aria-hidden
    />
  );
}
