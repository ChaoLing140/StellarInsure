import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CreatePolicyPage from "./page";

describe("CreatePolicyPage", () => {
  it("formats the coverage amount input as the user types", () => {
    render(<CreatePolicyPage />);

    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    const coverageInput = screen.getByLabelText(/coverage amount \(xlm\)/i);
    fireEvent.change(coverageInput, { target: { value: "12000.5" } });

    expect(coverageInput).toHaveValue("12,000.5");
  });

  it("shows a max constraint error when coverage exceeds the supported limit", () => {
    render(<CreatePolicyPage />);

    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    const coverageInput = screen.getByLabelText(/coverage amount \(xlm\)/i);
    fireEvent.change(coverageInput, { target: { value: "1000001" } });
    fireEvent.blur(coverageInput);

    expect(screen.getByText(/coverage amount cannot exceed 1,000,000.00 xlm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to review/i })).toBeDisabled();
  });
});
