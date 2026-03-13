import React from "react";
import { View, Text, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface InfoBannerProps {
  icon: LucideIcon;
  iconSize?: number;
  title: string;
  description: string;
  /** Botón opcional (ej: "Enviar mensaje") */
  ctaLabel?: string;
  ctaIcon?: LucideIcon;
  onCtaPress?: () => void;
}

/**
 * Banner informativo reutilizable con ícono, título y descripción.
 * Usado en Notificaciones, Soporte y otras pantallas.
 */
export function InfoBanner({
  icon: Icon,
  iconSize = 90,
  title,
  description,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCtaPress,
}: InfoBannerProps) {
  return (
    <View className="rounded-[24px] bg-primary p-5 shadow-premium-dark relative overflow-hidden">
      <View className="absolute -right-4 -top-4 opacity-10">
        <Icon size={iconSize} color="#FFFFFF" />
      </View>
      <Text className="text-base font-sans-bold text-white mb-1">{title}</Text>
      <Text className="text-[13px] font-sans text-slate-300 leading-relaxed">
        {description}
      </Text>
      {ctaLabel && onCtaPress && (
        <Pressable
          onPress={onCtaPress}
          className="flex-row items-center self-start gap-2 rounded-full bg-accent px-5 py-3 mt-4 active:bg-[#8C6D2E] active:scale-[0.97]"
        >
          {CtaIcon && <CtaIcon size={16} color="#FFFFFF" />}
          <Text className="text-sm font-sans-bold uppercase tracking-[1.5px] text-white">
            {ctaLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
