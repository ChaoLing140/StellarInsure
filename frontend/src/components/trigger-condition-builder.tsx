"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";

export type Operator = ">" | "<" | "=" | ">=" | "<=";

export interface ConditionRule {
  field: string;
  operator: Operator;
  value: string;
}

interface TriggerConditionBuilderProps {
  initialRules?: ConditionRule[];
  value?: string;
  onChange: (conditionString: string) => void;
  availableFields?: { id: string; label: string }[];
}

const DEFAULT_FIELDS = [
  { id: "temperature", label: "Temperature (°C)" },
  { id: "rainfall", label: "Rainfall (mm)" },
  { id: "wind_speed", label: "Wind Speed (km/h)" },
  { id: "delay_minutes", label: "Delay (minutes)" },
];

function createDefaultRule(availableFields: { id: string; label: string }[]): ConditionRule {
  return { field: availableFields[0]?.id ?? "", operator: ">", value: "" };
}

function serializeRules(currentRules: ConditionRule[]) {
  return currentRules
    .filter((r) => r.value.trim() !== "")
    .map((r) => `${r.field} ${r.operator} ${r.value}`)
    .join(" AND ");
}

function parseConditionValue(
  conditionString: string,
  availableFields: { id: string; label: string }[],
): ConditionRule[] {
  const parsedRules = conditionString
    .split(/\s+AND\s+/i)
    .map((part) => {
      const match = part.trim().match(/^(\S+)\s*(>=|<=|>|<|=)\s*(.+)$/);
      if (!match) return null;

      return {
        field: match[1],
        operator: match[2] as Operator,
        value: match[3].trim(),
      };
    })
    .filter((rule): rule is ConditionRule => rule !== null);

  return parsedRules.length > 0 ? parsedRules : [createDefaultRule(availableFields)];
}

export function TriggerConditionBuilder({
  initialRules,
  value,
  onChange,
  availableFields = DEFAULT_FIELDS,
}: TriggerConditionBuilderProps) {
  const [rules, setRules] = useState<ConditionRule[]>(
    value !== undefined
      ? parseConditionValue(value, availableFields)
      : initialRules || [createDefaultRule(availableFields)]
  );
  const lastEmittedValueRef = useRef(value);

  useEffect(() => {
    if (value === undefined || value === lastEmittedValueRef.current) return;
    setRules(parseConditionValue(value, availableFields));
  }, [availableFields, value]);

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const nextRules = [...rules];
    nextRules[index] = { ...nextRules[index], ...updates };
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const addRule = () => {
    const nextRules: ConditionRule[] = [...rules, { field: availableFields[0].id, operator: ">", value: "" }];
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    const nextRules = rules.filter((_, i) => i !== index);
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const notifyChange = (currentRules: ConditionRule[]) => {
    const str = serializeRules(currentRules);
    lastEmittedValueRef.current = str;
    onChange(str);
  };

  return (
    <div className="condition-builder">
      <div className="condition-builder__list">
        {rules.map((rule, index) => (
          <div key={index} className="condition-rule motion-panel">
            <div className="condition-rule__inputs">
              <select
                className="tx-select"
                value={rule.field}
                onChange={(e) => updateRule(index, { field: e.target.value })}
              >
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                className="tx-select tx-select--operator"
                value={rule.operator}
                onChange={(e) => updateRule(index, { operator: e.target.value as Operator })}
              >
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
              </select>

              <input
                className="field__input condition-rule__value"
                type="number"
                placeholder="Value"
                value={rule.value}
                onChange={(e) => updateRule(index, { value: e.target.value })}
              />
            </div>

            <button
              className="tx-expand-btn condition-rule__remove"
              type="button"
              aria-label="Remove rule"
              disabled={rules.length <= 1}
              onClick={() => removeRule(index)}
            >
              <Icon name="close" size="sm" tone="warning" />
            </button>
          </div>
        ))}
      </div>

      <button className="cta-secondary condition-builder__add" type="button" onClick={addRule}>
        <Icon name="plus" size="sm" tone="accent" />
        Add Condition
      </button>

      <div className="condition-preview">
        <span className="metadata-label">Previewed Logic</span>
        <code className="condition-preview__code">
          {rules.filter((r) => r.value.trim() !== "").length > 0
            ? serializeRules(rules)
            : "No valid conditions set"}
        </code>
      </div>
    </div>
  );
}
