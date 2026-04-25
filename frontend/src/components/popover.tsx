"use client";

import React, { useState, useRef, useEffect } from "react";

export interface PopoverProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  offset?: number;
  closeOnBlur?: boolean;
  closeOnEscape?: boolean;
  children?: React.ReactNode;
}

export function Popover({
  trigger,
  content,
  placement = "bottom",
  offset = 8,
  closeOnBlur = true,
  closeOnEscape = true,
}: PopoverProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (closeOnBlur && !triggerRef.current?.contains(event.target as Node) && !popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (closeOnEscape && event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [open, closeOnBlur, closeOnEscape]);

  const getPositionStyles = (): React.CSSProperties => {
    if (!triggerRef.current) return {};

    const rect = triggerRef.current.getBoundingClientRect();
    const styles: React.CSSProperties = {
      position: "fixed",
      zIndex: 1000,
      minWidth: "200px",
    };

    switch (placement) {
      case "top":
        styles.bottom = window.innerHeight - rect.top + offset;
        styles.left = rect.left + rect.width / 2;
        styles.transform = "translateX(-50%)";
        break;
      case "bottom":
        styles.top = rect.bottom + offset;
        styles.left = rect.left + rect.width / 2;
        styles.transform = "translateX(-50%)";
        break;
      case "left":
        styles.top = rect.top + rect.height / 2;
        styles.right = window.innerWidth - rect.left + offset;
        styles.transform = "translateY(-50%)";
        break;
      case "right":
        styles.top = rect.top + rect.height / 2;
        styles.left = rect.right + offset;
        styles.transform = "translateY(-50%)";
        break;
    }

    return styles;
  };

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>

      {open && (
        <div
          ref={popoverRef}
          style={getPositionStyles()}
          className="popover"
          role="dialog"
          aria-modal="false"
        >
          <div className="popover-content">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
