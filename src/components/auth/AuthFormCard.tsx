import React from "react";
import { View } from "react-native";

interface AuthFormCardProps {
  children: React.ReactNode;
}

/**
 * Contenedor de formulario con estilo premium para pantallas de auth.
 */
export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <View className="overflow-hidden rounded-[40px] bg-white p-8 shadow-premium dark:bg-primary dark:shadow-premium-dark border border-slate-100 dark:border-white/5">
      {children}
    </View>
  );
}
