import React from "react";
import { Text, Pressable } from "react-native";
import { LogOut } from "lucide-react-native";

interface PaywallLogoutProps {
  onSignOut: () => void;
}

export function PaywallLogout({ onSignOut }: PaywallLogoutProps) {
  return (
    <Pressable
      onPress={onSignOut}
      className="mt-8 flex-row items-center justify-center gap-2 py-3 active:opacity-70"
    >
      <LogOut size={16} color="#64748B" />
      <Text className="text-[13px] font-sans-semi text-slate-500 dark:text-slate-400">
        Cerrar sesión
      </Text>
    </Pressable>
  );
}
