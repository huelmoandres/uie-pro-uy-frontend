import React from "react";
import { PostHogProvider as PostHogRNProvider } from "posthog-react-native";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.postHogApiKey as string | undefined;
const host =
  (Constants.expoConfig?.extra?.postHogHost as string | undefined) ??
  "https://eu.i.posthog.com";

/**
 * Proveedor de analytics (PostHog).
 * Si EXPO_PUBLIC_POSTHOG_API_KEY no está configurado, opera en modo no-op
 * y renderiza los children sin instrumentación. Nunca rompe la app.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <PostHogRNProvider
      apiKey={apiKey}
      options={{
        host,
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllTextInputs: true,
          maskAllImages: true,
        },
        captureAppLifecycleEvents: true,
      }}
    >
      {children}
    </PostHogRNProvider>
  );
}
