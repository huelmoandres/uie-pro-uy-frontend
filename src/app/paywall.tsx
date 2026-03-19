import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, Redirect, useLocalSearchParams } from "expo-router";
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
  const { feature, entry } = useLocalSearchParams<{
    feature?: string;
    entry?: string;
  }>();
  const { signOut } = useAuth();
  const { isPro, isInTrial } = useSubscription();
  const { handleSubscribe, handleRestore, isPurchasing, isRestoring } =
    usePaywallActions();

  // Solo se permite entrar al paywall desde PremiumGate (entry=gate) o Perfil (entry=profile).
  // Si se llegó por cualquier otro camino (estado de nav restaurado, deep link sin params, etc.)
  // redirige silenciosamente a la pantalla principal para evitar mostrar el paywall de forma
  // no intencional a usuarios que no tienen suscripción.
  if (entry !== "gate" && entry !== "profile") {
    return <Redirect href="/(tabs)" />;
  }

  // Freemium soft-lock: permitir volver atrás siempre.
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
