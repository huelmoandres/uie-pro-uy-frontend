import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { ChevronDown, ChevronUp, Info } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import type { ITributo } from "@app-types/tributo.types";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  item: ITributo;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatCurrency(value: number | null | undefined): string {
  const n = value ?? 0;
  return `$${n.toLocaleString("es-UY")}`;
}

function computeTotal(item: ITributo): number {
  const tasa = item.courtFee ?? 0;
  const impuesto = item.judicialTax ?? 0;
  const timbre = item.professionalStamp ?? 0;
  const vicesima = item.vicesima ?? 0;
  return tasa + impuesto + timbre + vicesima;
}

export const TributoCard = React.memo(({ item, isExpanded, onToggle }: Props) => {
  const handlePress = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  const total = computeTotal(item);
  const hasNotes = Boolean(item.judicialTaxNotes?.trim());

  return (
    <Pressable
      onPress={handlePress}
      className="mb-3 overflow-hidden rounded-[24px] bg-white p-4 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5 active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-900/60"
    >
      {/* Vista colapsada */}
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 pr-3 text-[14px] font-sans-bold leading-tight text-slate-900 dark:text-white"
          numberOfLines={isExpanded ? undefined : 2}
        >
          {item.processType}
        </Text>
        <View className="flex-row items-center gap-2 shrink-0">
          <View className="rounded-lg bg-primary/10 px-2.5 py-1.5 dark:bg-accent/10">
            <Text className="text-[11px] font-sans-bold text-primary dark:text-accent">
              Total aprox. {formatCurrency(total)}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={18} color="#B89146" />
          ) : (
            <ChevronDown size={18} color="#94A3B8" />
          )}
        </View>
      </View>

      {/* Vista expandida */}
      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
                Tasa Judicial
              </Text>
              <Text className="text-[12px] font-sans-semi text-slate-800 dark:text-slate-200">
                {formatCurrency(item.courtFee)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
                Impuesto Judicial
              </Text>
              <Text className="text-[12px] font-sans-semi text-slate-800 dark:text-slate-200">
                {formatCurrency(item.judicialTax)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
                Timbre Profesional
              </Text>
              <Text className="text-[12px] font-sans-semi text-slate-800 dark:text-slate-200">
                {formatCurrency(item.professionalStamp)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
                Vicésima
              </Text>
              <Text className="text-[12px] font-sans-semi text-slate-800 dark:text-slate-200">
                {formatCurrency(item.vicesima)}
              </Text>
            </View>
            {item.executionTax && (
              <View className="flex-row justify-between">
                <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
                  Impuesto Ejecuciones
                </Text>
                <Text className="text-[11px] font-sans-semi text-warning">
                  1% aplicable
                </Text>
              </View>
            )}
          </View>

          {hasNotes && (
            <View className="mt-3 flex-row gap-2 rounded-xl bg-amber-50/80 p-3 dark:bg-amber-900/15 dark:border dark:border-amber-800/30">
              <View className="shrink-0 pt-0.5">
                <Info size={16} color="#F59E0B" />
              </View>
              <Text className="flex-1 text-[12px] font-sans leading-relaxed text-slate-700 dark:text-slate-300">
                {item.judicialTaxNotes}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
});
TributoCard.displayName = "TributoCard";
