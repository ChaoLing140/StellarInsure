export interface ErrorLogContext {
  componentStack?: string | null;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

type LogLevel = "info" | "warn" | "error";

interface ErrorLogger {
  logError(error: Error, context?: ErrorLogContext): void;
  logMessage(message: string, level?: LogLevel): void;
}

function buildSentryAdapter(): ErrorLogger | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sentry = require("@sentry/nextjs");
    if (typeof sentry?.captureException !== "function") return null;
    return {
      logError(error, context) {
        sentry.captureException(error, {
          ...(context?.componentStack && {
            contexts: { react: { componentStack: context.componentStack } },
          }),
          ...(context?.tags && { tags: context.tags }),
          ...(context?.extra && { extra: context.extra }),
        });
      },
      logMessage(message, level = "info") {
        sentry.captureMessage(message, level);
      },
    };
  } catch {
    return null;
  }
}

const consoleAdapter: ErrorLogger = {
  logError(error, context) {
    console.error("[ErrorLogger]", error, context ?? "");
  },
  logMessage(message, level = "info") {
    (console[level] as typeof console.log)("[ErrorLogger]", message);
  },
};

const _adapter: ErrorLogger = buildSentryAdapter() ?? consoleAdapter;

export function logError(error: Error, context?: ErrorLogContext): void {
  _adapter.logError(error, context);
}

export function logMessage(message: string, level?: LogLevel): void {
  _adapter.logMessage(message, level);
}
