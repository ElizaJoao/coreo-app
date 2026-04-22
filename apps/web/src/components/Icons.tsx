type IconProps = {
  size?: number;
  className?: string;
};

function Icon({
  size = 16,
  className,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 1.6,
  children,
}: IconProps & {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return <Icon {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></Icon>;
}
export function IconSpark(p: IconProps) {
  return <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Icon>;
}
export function IconLibrary(p: IconProps) {
  return <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></Icon>;
}
export function IconCalendar(p: IconProps) {
  return <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>;
}
export function IconTrend(p: IconProps) {
  return <Icon {...p}><path d="M3 17l6-6 4 4 8-8M14 7h7v7" /></Icon>;
}
export function IconSettings(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  );
}
export function IconSearch(p: IconProps) {
  return <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>;
}
export function IconPlay(p: IconProps) {
  return <Icon {...p} fill="currentColor" stroke="none" strokeWidth={0}><path d="M7 4.5v15a.5.5 0 0 0 .77.42l12-7.5a.5.5 0 0 0 0-.84l-12-7.5A.5.5 0 0 0 7 4.5z" /></Icon>;
}
export function IconPause(p: IconProps) {
  return <Icon {...p} fill="currentColor" stroke="none" strokeWidth={0}><path d="M7 4h4v16H7zM13 4h4v16h-4z" /></Icon>;
}
export function IconPlus(p: IconProps) {
  return <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
}
export function IconArrowLeft(p: IconProps) {
  return <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
}
export function IconX(p: IconProps) {
  return <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
}
export function IconCheck(p: IconProps) {
  return <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
}
export function IconDots(p: IconProps) {
  return <Icon {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></Icon>;
}
export function IconMusic(p: IconProps) {
  return <Icon {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></Icon>;
}
export function IconGrid(p: IconProps) {
  return <Icon {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Icon>;
}
export function IconCopy(p: IconProps) {
  return <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
}
export function IconZap(p: IconProps) {
  return <Icon {...p}><path d="m13 2-9 12h7l-1 8 9-12h-7z" /></Icon>;
}
export function IconAdmin(p: IconProps) {
  return <Icon {...p}><path d="M12 2 3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z" /><path d="m9 12 2 2 4-4" /></Icon>;
}
