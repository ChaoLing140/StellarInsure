import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./auth-context";

function StatusDisplay() {
  const { status, session, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="userId">{session?.userId ?? "none"}</span>
    </div>
  );
}

function SignInButton() {
  const { signIn } = useAuth();
  return (
    <button
      onClick={() =>
        signIn({ userId: "u1", walletAddress: "GABC123", displayName: "Alice" })
      }
    >
      Sign In
    </button>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  return <button onClick={signOut}>Sign Out</button>;
}

function TestApp() {
  return (
    <AuthProvider>
      <StatusDisplay />
      <SignInButton />
      <SignOutButton />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("starts in loading then resolves to unauthenticated with no session", async () => {
    render(<TestApp />);
    await act(async () => {});
    expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
  });

  it("restores session from sessionStorage on mount", async () => {
    sessionStorage.setItem(
      "stellarinsure-session",
      JSON.stringify({ userId: "u99", walletAddress: null, displayName: "Bob" }),
    );
    render(<TestApp />);
    await act(async () => {});
    expect(screen.getByTestId("status").textContent).toBe("authenticated");
    expect(screen.getByTestId("userId").textContent).toBe("u99");
  });

  it("signIn sets status to authenticated and persists to sessionStorage", async () => {
    render(<TestApp />);
    await act(async () => {});
    await act(async () => {
      screen.getByRole("button", { name: "Sign In" }).click();
    });
    expect(screen.getByTestId("status").textContent).toBe("authenticated");
    expect(screen.getByTestId("userId").textContent).toBe("u1");
    expect(sessionStorage.getItem("stellarinsure-session")).toContain("u1");
  });

  it("signOut clears session and sessionStorage", async () => {
    render(<TestApp />);
    await act(async () => {});
    await act(async () => {
      screen.getByRole("button", { name: "Sign In" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "Sign Out" }).click();
    });
    expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("userId").textContent).toBe("none");
    expect(sessionStorage.getItem("stellarinsure-session")).toBeNull();
  });

  it("useAuth throws when used outside AuthProvider", () => {
    const ThrowingComponent = () => {
      useAuth();
      return null;
    };
    expect(() => render(<ThrowingComponent />)).toThrow(
      "useAuth must be used inside AuthProvider",
    );
  });
});
