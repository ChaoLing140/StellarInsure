import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  restorePolicyDraft,
  serializePolicyDraft,
  useAutosave,
  usePolicyDraftAutosave,
} from "./use-autosave";

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
    localStorage.setItem(
      "test-key",
      JSON.stringify({ data: { name: "restored" }, updatedAt: 1000 }),
    );

    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));
    expect(result.current[0]).toEqual({ name: "restored" });
  });

  it("restores legacy drafts without an envelope", () => {
    localStorage.setItem("test-key", JSON.stringify({ name: "legacy" }));

    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));
    expect(result.current[0]).toEqual({ name: "legacy" });
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
    expect(stored.data).toEqual({ name: "updated" });
    expect(typeof stored.updatedAt).toBe("number");
  });

  it("clears state and localStorage when clear is called", () => {
    localStorage.setItem(
      "test-key",
      JSON.stringify({ data: { name: "existing" }, updatedAt: 1000 }),
    );

    const { result } = renderHook(() => useAutosave("test-key", { name: "" }));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toEqual({ name: "" });
    expect(localStorage.getItem("test-key")).toBeNull();
  });
});

describe("usePolicyDraftAutosave", () => {
  it("keeps a reversible backup when clearing a draft", () => {
    localStorage.setItem(
      "policy-draft",
      JSON.stringify({ data: { name: "saved" }, updatedAt: 1000 }),
    );

    const { result } = renderHook(() =>
      usePolicyDraftAutosave("policy-draft", { name: "" }),
    );

    act(() => {
      result.current.clear();
    });

    expect(result.current.state).toEqual({ name: "" });
    expect(result.current.hasClearedBackup).toBe(true);

    let restored: { name: string } | null = null;
    act(() => {
      restored = result.current.restoreCleared();
    });
    expect(restored).toEqual({ name: "saved" });
    expect(result.current.state).toEqual({ name: "saved" });
    expect(result.current.hasClearedBackup).toBe(false);
  });

  it("does not restore storage updates that are older than in-memory edits", () => {
    const { result } = renderHook(() =>
      usePolicyDraftAutosave("policy-draft", { name: "" }),
    );

    act(() => {
      result.current.setState({ name: "newer" });
      vi.advanceTimersByTime(600);
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "policy-draft",
          newValue: JSON.stringify({ data: { name: "stale" }, updatedAt: 1 }),
        }),
      );
    });

    expect(result.current.state).toEqual({ name: "newer" });
  });
});

describe("policy draft serialization helpers", () => {
  it("serializes and restores draft payloads", () => {
    const raw = serializePolicyDraft({ name: "draft" });
    expect(restorePolicyDraft(raw, { name: "" })).toEqual({ name: "draft" });
  });
});
