import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PolicyDetailPage from "./page";

describe("PolicyDetailPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the policy summary after loading completes", () => {
    render(<PolicyDetailPage params={{ policyId: "weather-alpha" }} />);

    expect(screen.getByText(/loading policy snapshot/i)).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("heading", { name: /northern plains weather guard/i })).toBeInTheDocument();
    expect(screen.getByText(/print policy packet/i)).toBeInTheDocument();
  });

  it("renders an empty claim state for policies without claims", () => {
    render(<PolicyDetailPage params={{ policyId: "flight-orbit" }} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/no claims filed yet/i)).toBeInTheDocument();
  });

  it("shows validation errors when the assistance form is submitted empty", async () => {
    render(<PolicyDetailPage params={{ policyId: "weather-alpha" }} />);

    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByRole("button", { name: /save handoff draft/i }));

    expect(screen.getByText(/enter the contact name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a phone number/i)).toBeInTheDocument();
  });
});
