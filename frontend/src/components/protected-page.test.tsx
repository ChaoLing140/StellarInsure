import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ProtectedPage } from "./protected-page";
import { mockRouter } from "@/test/mocks/next-navigation";

vi.mock("@/context/auth-context");

import { useAuth } from "@/context/auth-context";

const mockUseAuth = vi.mocked(useAuth);

const baseAuth = {
  session: null,
  isAuthenticated: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

describe("ProtectedPage", () => {
  beforeEach(() => {
    vi.spyOn(mockRouter, "replace").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading skeleton while auth status is loading", () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, status: "loading" });
    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("renders nothing and redirects to / when unauthenticated", async () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, status: "unauthenticated" });
    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );
    await act(async () => {});
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("renders children when authenticated", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      status: "authenticated",
      isAuthenticated: true,
      session: { userId: "u1", walletAddress: "GABC", displayName: "Alice" },
    });
    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("does not redirect when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      status: "authenticated",
      isAuthenticated: true,
      session: { userId: "u1", walletAddress: "GABC", displayName: "Alice" },
    });
    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );
    await act(async () => {});
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
