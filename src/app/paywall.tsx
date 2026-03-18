import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
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
  const { signOut } = useAuth();
  const { isPro, isInTrial } = useSubscription();
  const { handleSubscribe, handleRestore, isPurchasing, isRestoring } =
    usePaywallActions();

  // Mostrar flecha atrás cuando el usuario tiene Pro o trial (accedió desde perfil).
  // Ocultar cuando no tiene acceso (fue redirigido y no debe volver).
  const canGoBack = isPro || isInTrial;

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
        <PaywallHero />
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
