/**
 * Error tracking y logging para debugging.
 * En __DEV__: log detallado a consola.
 * En producción: preparado para integrar Sentry (ver DEBUGGING.md).
 */

type ErrorContext = {
  pathname?: string;
  isPro?: boolean;
  isInTrial?: boolean;
  isAuthenticated?: boolean;
};

let lastContext: ErrorContext = {};

export function setErrorContext(ctx: ErrorContext) {
  lastContext = { ...lastContext, ...ctx };
}

export function initErrorTracking() {
  const ErrorUtils = (global as { ErrorUtils?: { getGlobalHandler: () => (e: unknown, f?: boolean) => void; setGlobalHandler: (h: (e: unknown, f?: boolean) => void) => void } }).ErrorUtils;
  if (!ErrorUtils) return;

  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    const err = error instanceof Error ? error : new Error(String(error));
    const report = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      isFatal: isFatal ?? false,
      context: lastContext,
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.error("[ErrorTracking]", JSON.stringify(report, null, 2));
      console.error("[ErrorTracking] Stack:", err.stack);
    }

    // Aquí podés integrar Sentry:
    // if (Sentry) Sentry.captureException(err, { extra: report });

    originalHandler(error, isFatal);
  });
}
