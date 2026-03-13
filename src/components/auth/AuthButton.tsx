import React from "react";
import { Pressable, Text } from "react-native";

interface AuthButtonProps {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Estilo secundario (ej: "Verificar correo"). */
  variant?: "primary" | "secondary";
}

/**
 * Botón unificado para pantallas de auth.
 */
export function AuthButton({
  label,
  loadingLabel,
  isLoading = false,
  onPress,
  disabled = false,
  variant = "primary",
}: AuthButtonProps) {
  const isDisabled = disabled || isLoading;
  const displayText = isLoading && loadingLabel ? loadingLabel : label;

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className="mt-4 flex-row items-center justify-center rounded-2xl border border-accent/30 bg-accent/5 py-3 dark:bg-accent/10 active:opacity-70"
      >
        <Text className="text-sm font-sans-semi text-accent">
          {displayText}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      className="items-center justify-center rounded-full bg-accent py-4 shadow-lg shadow-accent/40 active:scale-[0.98] active:bg-accent-dark disabled:opacity-50"
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-white">
        {displayText}
      </Text>
    </Pressable>
  );
}
