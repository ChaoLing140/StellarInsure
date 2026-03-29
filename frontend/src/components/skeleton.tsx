import React from "react";

/**
 * Basic shimmering skeleton block.
 * Usage: <Skeleton className="w-full h-8" /> or with inline style width/height.
 */
export function Skeleton({
  className = "",
  style,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`ob-skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Multi-line skeleton text.
 * Renders multiple lines with decreasing widths for a natural text shape.
 */
export function SkeletonText({
  lines = 3,
  className = "",
  style,
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ob-skeleton-text-group ${className}`} style={style} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => {
        // Simple logic: last line is shorter if there's more than 1
        const width = lines > 1 && i === lines - 1 ? "60%" : "100%";
        return (
          <div
            key={`skeleton-line-${i}`}
            className="ob-skeleton"
            style={{ width, height: "1em", marginBottom: "0.5em" }}
          />
        );
      })}
    </div>
  );
}
