import React from "react";

export type IconName =
  | "alert"
  | "calendar"
  | "check"
  | "clock"
  | "document"
  | "globe"
  | "heart"
  | "language"
  | "shield"
  | "spark"
  | "wallet"
  | "arrow-up-right"
  | "chevron-down"
  | "chevron-up";

type IconSize = "sm" | "md" | "lg";
type IconTone =
  | "default"
  | "muted"
  | "accent"
  | "warning"
  | "success"
  | "danger"
  | "contrast";

type IconProps = {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  label?: string;
  className?: string;
};

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const toneMap: Record<IconTone, string> = {
  default: "var(--text)",
  muted: "var(--text-muted)",
  accent: "var(--accent-strong)",
  warning: "var(--warning-strong)",
  success: "var(--success-strong)",
  danger: "var(--danger-strong)",
  contrast: "var(--surface)",
};

function getPath(name: IconName) {
  switch (name) {
    case "alert":
      return (
        <>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </>
      );
    case "calendar":
      return (
        <>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
        </>
      );
    case "check":
      return <path d="M5 12l5 5L20 7" />;
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6l4 2" />
        </>
      );
    case "document":
      return (
        <>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </>
      );
    case "heart":
      return (
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
      );
    case "globe":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14.5 14.5 0 0 1 0 18" />
          <path d="M12 3a14.5 14.5 0 0 0 0 18" />
        </>
      );
    case "language":
      return (
        <>
          <path d="M4 5h12" />
          <path d="M10 5a16 16 0 0 1-4 9" />
          <path d="M6 14c2 0 5 1 7 3" />
          <path d="m14 19 4-10 4 10" />
          <path d="M15.5 15h5" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
          <path d="m9.5 12 1.75 1.75L15 10" />
        </>
      );
    case "spark":
      return (
        <>
          <path d="m12 2 1.7 4.3L18 8l-4.3 1.7L12 14l-1.7-4.3L6 8l4.3-1.7Z" />
          <path d="m5 16 .8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8Z" />
        </>
      );
    case "wallet":
      return (
        <>
          <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <path d="M16 12h3" />
          <path d="M3 9h16" />
        </>
      );
    case "arrow-up-right":
      return (
        <>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </>
      );
    case "chevron-down":
      return <path d="m6 9 6 6 6-6" />;
    case "chevron-up":
      return <path d="m6 15 6-6 6 6" />;
  }
}

export function Icon({
  name,
  size = "md",
  tone = "default",
  label,
  className,
}: IconProps) {
  const dimension = sizeMap[size];
  const ariaHidden = label ? undefined : true;

  return (
    <svg
      aria-hidden={ariaHidden}
      aria-label={label}
      className={className}
      fill="none"
      height={dimension}
      role={label ? "img" : undefined}
      stroke={toneMap[tone]}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={dimension}
      xmlns="http://www.w3.org/2000/svg"
    >
      {getPath(name)}
    </svg>
  );
}
