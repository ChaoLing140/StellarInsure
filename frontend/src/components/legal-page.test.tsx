import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LegalPage } from "./legal-page";

const MOCK_SECTIONS = [
  {
    id: "intro",
    heading: "Introduction",
    body: <p>Intro body text.</p>,
  },
  {
    id: "data",
    heading: "Data Collection",
    body: <p>Data body text.</p>,
  },
] as const;

describe("LegalPage", () => {
  it("renders the page title and eyebrow", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeDefined();
    expect(screen.getByText("Legal")).toBeDefined();
  });

  it("renders all section headings", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    expect(screen.getByRole("heading", { name: /Introduction/ })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Data Collection/ })).toBeDefined();
  });

  it("renders section body content", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    expect(screen.getByText("Intro body text.")).toBeDefined();
    expect(screen.getByText("Data body text.")).toBeDefined();
  });

  it("renders the last-updated date", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    expect(screen.getByText("March 28, 2026")).toBeDefined();
  });

  it("renders a table of contents with links to each section", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    const toc = screen.getByRole("navigation", { name: "Table of contents" });
    expect(toc).toBeDefined();

    const tocLinks = toc.querySelectorAll("a");
    expect(tocLinks).toHaveLength(MOCK_SECTIONS.length);
    expect(tocLinks[0].getAttribute("href")).toBe("#intro");
    expect(tocLinks[1].getAttribute("href")).toBe("#data");
  });

  it("renders the related link when provided", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
        relatedLink={{ href: "/legal/terms", label: "Terms of Service" }}
      />,
    );

    const links = screen.getAllByRole("link", { name: "Terms of Service" });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("href")).toBe("/legal/terms");
  });

  it("renders the main landmark with correct id", () => {
    render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    const main = screen.getByRole("main");
    expect(main.id).toBe("main-content");
  });

  it("each section heading has a matching id anchor", () => {
    const { container } = render(
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated="March 28, 2026"
        sections={MOCK_SECTIONS}
      />,
    );

    for (const section of MOCK_SECTIONS) {
      const heading = container.querySelector(`h2#${section.id}`);
      expect(heading, `h2#${section.id} should exist`).not.toBeNull();
    }
  });
});
