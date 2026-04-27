import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("error-logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("logError does not throw when called without context", async () => {
    const { logError } = await import("./error-logger");
    expect(() => logError(new Error("simple"))).not.toThrow();
  });

  it("logError passes componentStack as react context to Sentry", async () => {
    const sentry = await import("@sentry/nextjs");
    const { logError } = await import("./error-logger");
    const err = new Error("ctx-error");
    logError(err, { componentStack: "at Foo" });
    expect(sentry.captureException).toHaveBeenCalledWith(
      err,
      expect.objectContaining({
        contexts: expect.objectContaining({
          react: expect.objectContaining({ componentStack: "at Foo" }),
        }),
      }),
    );
  });

  it("logError passes tags and extra when provided", async () => {
    const sentry = await import("@sentry/nextjs");
    const { logError } = await import("./error-logger");
    const err = new Error("tagged");
    logError(err, { tags: { page: "home" }, extra: { userId: "u1" } });
    expect(sentry.captureException).toHaveBeenCalledWith(
      err,
      expect.objectContaining({
        tags: { page: "home" },
        extra: { userId: "u1" },
      }),
    );
  });

  it("logError omits contexts key when componentStack is null", async () => {
    const sentry = await import("@sentry/nextjs");
    const { logError } = await import("./error-logger");
    const err = new Error("no-stack");
    logError(err, { tags: { page: "home" } });
    const call = (sentry.captureException as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).not.toHaveProperty("contexts");
  });

  it("logMessage calls captureMessage with the given level", async () => {
    const sentry = await import("@sentry/nextjs");
    const { logMessage } = await import("./error-logger");
    logMessage("hello", "warn");
    expect(sentry.captureMessage).toHaveBeenCalledWith("hello", "warn");
  });

  it("logMessage defaults to info level", async () => {
    const sentry = await import("@sentry/nextjs");
    const { logMessage } = await import("./error-logger");
    logMessage("greet");
    expect(sentry.captureMessage).toHaveBeenCalledWith("greet", "info");
  });
});
