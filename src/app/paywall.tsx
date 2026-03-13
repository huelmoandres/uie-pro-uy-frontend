import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { useSubscription } from "@context/SubscriptionContext";
import { usePaywallActions } from "@hooks/usePaywallActions";
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

  return (
    <>
      <Stack.Screen options={{ title: "IUE.uy Pro", headerShown: true }} />
      <ScrollView
        className="flex-1 bg-background-light dark:bg-background-dark"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaywallHero />
        <PaywallBenefits />
        <PaywallCta
          onSubscribe={handleSubscribe}
          onRestore={handleRestore}
          isPurchasing={isPurchasing}
          isRestoring={isRestoring}
          isPro={isPro || isInTrial}
        />
        <PaywallLegal />
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
