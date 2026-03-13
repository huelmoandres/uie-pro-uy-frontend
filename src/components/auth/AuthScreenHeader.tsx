import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, LucideIcon } from "lucide-react-native";

interface AuthScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  showBackButton?: boolean;
}

/**
 * Header reutilizable para pantallas de auth (login, registro, verificación, etc.).
 */
export function AuthScreenHeader({
  title,
  subtitle,
  icon: Icon,
  showBackButton = true,
}: AuthScreenHeaderProps) {
  return (
    <>
      {showBackButton && (
        <View className="px-6 pt-12">
          <Pressable
            onPress={() => router.back()}
            className="mb-6 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 active:opacity-70"
          >
            <ChevronLeft size={20} color="#64748B" />
          </Pressable>
        </View>
      )}
      <View className="px-6 pb-8 items-center">
        {Icon && (
          <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-primary shadow-premium dark:bg-white/5 dark:shadow-premium-dark mb-6">
            <Icon size={32} color="#B89146" />
          </View>
        )}
        <Text className="text-2xl font-sans-bold text-center text-slate-900 dark:text-white">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm font-sans text-center text-slate-500 dark:text-slate-400 mt-2 px-4">
            {subtitle}
          </Text>
        )}
      </View>
    </>
  );
}
