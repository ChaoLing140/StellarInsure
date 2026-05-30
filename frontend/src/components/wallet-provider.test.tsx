import { describe, expect, it } from "vitest";

import { mapWalletConnectionError } from "./wallet-provider";

describe("mapWalletConnectionError", () => {
  it("returns a friendly message when the wallet request is rejected", () => {
    expect(mapWalletConnectionError(new Error("User rejected access"))).toBe(
      "The wallet request was declined. You can try connecting again when you are ready.",
    );
  });

  it("returns a friendly message when no wallet is installed", () => {
    expect(mapWalletConnectionError(new Error("No wallet installed"))).toBe(
      "No supported wallet was found. Install Freighter, Lobstr, or xBull, then try again.",
    );
  });

  it("returns a generic retryable message for unknown failures", () => {
    expect(mapWalletConnectionError(new Error("unexpected failure"))).toBe(
      "We could not connect your wallet. Please try again.",
    );
  });
});
