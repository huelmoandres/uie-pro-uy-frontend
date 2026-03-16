import React from "react";
import { Pressable, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

export interface EducationalEmptyStateProps {
  /** Título principal del empty state */
  title: string;
  /** Descripción educativa */
  description: string;
  /** Icono Lucide (ej: FolderOpen, GitCompare, CalendarClock) */
  icon: LucideIcon;
  /** Color del icono (default: #94A3B8) */
  iconColor?: string;
  /** Tamaño del icono (default: 48) */
  iconSize?: number;
  /** CTA principal - botón prominente */
  primaryCta: {
    label: string;
    onPress: () => void;
  };
  /** CTA secundario opcional */
  secondaryCta?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Empty state educativo reutilizable.
 * Usado en lista de expedientes, comparación y agenda.
 */
export function EducationalEmptyState({
  title,
  description,
  icon: Icon,
  iconColor = "#94A3B8",
  iconSize = 48,
  primaryCta,
  secondaryCta,
}: EducationalEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <View className="items-center">
        <Icon size={iconSize} color={iconColor} />
        <Text className="mt-4 text-center font-sans-semi text-slate-700 dark:text-slate-300">
          {title}
        </Text>
        <Text className="mt-2 text-center text-[13px] font-sans leading-[20px] text-slate-500 dark:text-slate-400">
          {description}
        </Text>
      </View>

      <View className="mt-8 w-full max-w-[280px] gap-3">
        <Pressable
          onPress={primaryCta.onPress}
          className="items-center justify-center rounded-2xl bg-accent py-4 shadow-lg shadow-accent/30 active:scale-[0.98] active:bg-accent-dark"
        >
          <Text className="text-sm font-sans-bold uppercase tracking-[2px] text-white">
            {primaryCta.label}
          </Text>
        </Pressable>
        {secondaryCta && (
          <Pressable
            onPress={secondaryCta.onPress}
            className="items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-3 dark:border-white/10 dark:bg-white/5 active:opacity-70"
          >
            <Text className="text-sm font-sans-semi text-slate-600 dark:text-slate-400">
              {secondaryCta.label}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
