import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { useAutosave } from "./use-autosave";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

describe("useAutosave", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));
    expect(result.current[0]).toEqual({ name: "" });
  });

  it("restores a previously saved value from localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify({ name: "restored" }));

    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));
    expect(result.current[0]).toEqual({ name: "restored" });
  });

  it("persists state changes to localStorage after debounce", () => {
    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));

    act(() => {
      result.current[1]({ name: "updated" });
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    const stored = JSON.parse(localStorage.getItem("test-key") ?? "{}");
    expect(stored).toEqual({ name: "updated" });
  });

  it("clears state and localStorage when clear is called", () => {
    localStorage.setItem("test-key", JSON.stringify({ name: "existing" }));

    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toEqual({ name: "" });
    expect(localStorage.getItem("test-key")).toBeNull();
  });
});
