import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/i18n/provider";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the main landmarks and translated sections", () => {
    render(
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>,
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /parametric insurance: payouts without the paperwork/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore coverage/i })).toBeInTheDocument();
  });
});
