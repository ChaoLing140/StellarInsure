import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PolicyTypeSelector, type PolicyType } from "./policy-type-selector";

describe("PolicyTypeSelector", () => {
  it("renders all five policy type cards", () => {
    render(<PolicyTypeSelector selected={null} onSelect={vi.fn()} />);

    expect(screen.getByText("Weather Protection")).toBeInTheDocument();
    expect(screen.getByText("Flight Delay")).toBeInTheDocument();
    expect(screen.getByText("Smart Contract")).toBeInTheDocument();
    expect(screen.getByText("Asset Protection")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
  });

  it("calls onSelect with the correct type when a card is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PolicyTypeSelector selected={null} onSelect={onSelect} />);

    await user.click(screen.getByText("Flight Delay"));

    expect(onSelect).toHaveBeenCalledWith("flight");
  });

  it("marks the selected card with aria-checked", () => {
    render(<PolicyTypeSelector selected={"weather" as PolicyType} onSelect={vi.fn()} />);

    const weatherCard = screen.getByRole("radio", { name: /Weather Protection/i });
    expect(weatherCard).toHaveAttribute("aria-checked", "true");

    const flightCard = screen.getByRole("radio", { name: /Flight Delay/i });
    expect(flightCard).toHaveAttribute("aria-checked", "false");
  });
});
