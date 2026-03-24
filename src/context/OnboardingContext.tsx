import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_SEEN_KEY } from "@/constants/onboarding";

interface OnboardingContextValue {
  hasSeenOnboarding: boolean | null;
  isLoading: boolean;
  markOnboardingSeen: () => Promise<void>;
  /** Solo dev: borra la clave para ver el onboarding de nuevo */
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((value) => {
      setHasSeenOnboarding(value === "true");
    });
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    setHasSeenOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(ONBOARDING_SEEN_KEY);
    setHasSeenOnboarding(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        hasSeenOnboarding,
        isLoading: hasSeenOnboarding === null,
        markOnboardingSeen,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
