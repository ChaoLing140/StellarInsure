"use client";

import React from "react";

function formatIntegerPart(value: string) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/^0+(?=\d)/, "");
  const digits = normalized || "0";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function normalizeAmountInput(value: string, maxDecimals = 2) {
  const sanitized = value.replace(/[^\d.]/g, "");

  if (!sanitized) {
    return "";
  }

  const firstDecimalIndex = sanitized.indexOf(".");
  const hasDecimal = firstDecimalIndex >= 0;
  const integerRaw = hasDecimal ? sanitized.slice(0, firstDecimalIndex) : sanitized;
  const decimalRaw = hasDecimal
    ? sanitized.slice(firstDecimalIndex + 1).replace(/\./g, "").slice(0, maxDecimals)
    : "";

  const formattedInteger = formatIntegerPart(integerRaw);

  if (hasDecimal) {
    const integerValue = formattedInteger || "0";
    return `${integerValue}.${decimalRaw}`;
  }

  return formattedInteger;
}

export function parseAmountInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatAssetAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type AmountInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  maxDecimals?: number;
  formatOnBlur?: boolean;
};

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
  {
    maxDecimals = 2,
    formatOnBlur = false,
    inputMode = "decimal",
    onBlur,
    onChange,
    value,
    ...props
  },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(event) => onChange(normalizeAmountInput(event.target.value, maxDecimals))}
      onBlur={(event) => {
        if (formatOnBlur) {
          const parsed = parseAmountInput(value);
          if (parsed !== null) {
            onChange(formatAssetAmount(parsed));
          }
        }

        onBlur?.(event);
      }}
    />
  );
});
