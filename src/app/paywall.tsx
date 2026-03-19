import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { useSubscription } from "@context/SubscriptionContext";
import { usePaywallActions } from "@hooks/usePaywallActions";
import { HeaderBackButton } from "@components/shared/HeaderBackButton";
import {
  PaywallHero,
  PaywallBenefits,
  PaywallCta,
  PaywallLegal,
  PaywallLogout,
} from "@components/features/paywall";

export default function PaywallScreen() {
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const { signOut } = useAuth();
  const { isPro, isInTrial } = useSubscription();
  const { handleSubscribe, handleRestore, isPurchasing, isRestoring } =
    usePaywallActions();

  // Freemium soft-lock: permitir volver atrás siempre.
  // El bloqueo de funciones ocurre en el gate de cada feature.
  const canGoBack = true;

  return (
    <>
      <Stack.Screen
        options={{
          title: "IUE.uy Pro",
          headerShown: true,
          headerBackVisible: false,
          gestureEnabled: canGoBack,
          headerLeft: canGoBack ? () => <HeaderBackButton /> : () => null,
        }}
      />
      <ScrollView
        className="flex-1 bg-background-light dark:bg-background-dark"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaywallHero featureParam={feature} />
        <PaywallBenefits />
        <PaywallLegal />
        <PaywallCta
          onSubscribe={handleSubscribe}
          onRestore={handleRestore}
          isPurchasing={isPurchasing}
          isRestoring={isRestoring}
          isPro={isPro || isInTrial}
        />
        <PaywallLogout onSignOut={signOut} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
});
