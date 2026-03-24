import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Hash, ChevronRight, FileText, Calendar } from "lucide-react-native";
import type { IExpediente } from "@app-types/expediente.types";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";
import { stripHtml, formatDate } from "@utils/formatters";
import { MovementItem } from "./MovementItem";
import { flattenTimeline } from "@app-types/expediente.types";

interface Props {
  expediente: IExpediente | null;
  plazosOpen: IAgendaItem[];
  isLoading?: boolean;
  /** En vista lado a lado: ocupa todo el ancho y header compacto */
  fillWidth?: boolean;
}

const LAST_MOVEMENTS_COUNT = 5;

export const CompareExpedientePanel = React.memo(
  ({ expediente, plazosOpen, isLoading, fillWidth }: Props) => {
    const handlePress = () => {
      if (expediente) {
        router.push(`/expedientes/${expediente.iue.replace("/", ":")}`);
      }
    };

    if (isLoading || !expediente) {
      return (
        <View
          className={`flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/60 ${!fillWidth ? "max-w-[360px]" : ""}`}
        >
          <View className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-700/50 mb-4" />
          <View className="h-5 w-full rounded bg-slate-200 dark:bg-slate-700/50 mb-2" />
          <View className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700/50 mb-6" />
          <View className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700/50" />
        </View>
      );
    }

    const flatMovements = flattenTimeline(expediente.movements);
    const lastMovements = flatMovements.slice(-LAST_MOVEMENTS_COUNT).reverse();

    return (
      <Pressable
        onPress={handlePress}
        className={`flex-1 min-w-[200px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800/60 dark:shadow-none active:scale-[0.98] ${!fillWidth ? "max-w-[360px]" : ""}`}
      >
        {/* Header */}
        <View
          className={`border-b border-slate-100 dark:border-white/5 ${fillWidth ? "px-3 py-2" : "p-4"}`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center rounded-lg bg-slate-100 px-2 py-1 dark:bg-white/10 shrink-0">
              <Hash size={10} color="#64748B" />
              <Text className="ml-1 text-[9px] font-sans-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {expediente.iue}
              </Text>
            </View>
            <ChevronRight size={14} color="#94A3B8" />
          </View>
          <Text
            className={`font-sans-bold text-slate-900 dark:text-white ${fillWidth ? "mt-1.5 text-[11px] leading-tight" : "mt-3 text-[14px] leading-snug"}`}
            numberOfLines={fillWidth ? 1 : 2}
          >
            {stripHtml(expediente.caratula) || "Sin carátula"}
          </Text>
        </View>

        {/* Últimos movimientos */}
        <View
          className={`border-b border-slate-100 dark:border-white/5 ${fillWidth ? "px-3 py-2" : "p-4"}`}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <FileText size={13} color="#64748B" />
            <Text className="text-[11px] font-sans-semi uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Últimos {LAST_MOVEMENTS_COUNT} movimientos
            </Text>
          </View>
          {lastMovements.length === 0 ? (
            <Text className="text-[12px] font-sans text-slate-400">
              Sin movimientos
            </Text>
          ) : (
            <View className="gap-0">
              {lastMovements.map((m, idx) => (
                <MovementItem
                  key={`${m.fecha}-${m.tipo}-${idx}`}
                  item={m}
                  isFirst={idx === 0}
                  isLast={idx === lastMovements.length - 1}
                  compact
                />
              ))}
            </View>
          )}
        </View>

        {/* Plazos OPEN */}
        <View className={fillWidth ? "px-3 py-2" : "p-4"}>
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={13} color="#64748B" />
            <Text className="text-[11px] font-sans-semi uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Plazos abiertos
            </Text>
          </View>
          {plazosOpen.length === 0 ? (
            <Text className="text-[12px] font-sans text-slate-400 dark:text-slate-500">
              Sin plazos pendientes
            </Text>
          ) : (
            <View className="gap-2">
              {plazosOpen.map((p) => (
                <View
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                >
                  <Text
                    className="text-[11px] font-sans-semi text-slate-700 dark:text-slate-300"
                    numberOfLines={2}
                  >
                    {stripHtml(p.detectedText) || "Plazo"}
                  </Text>
                  <Text className="mt-0.5 text-[10px] font-sans text-slate-500 dark:text-slate-400">
                    Vence: {formatDate(p.dueDate)} ({p.daysRemaining} días)
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
  },
);
CompareExpedientePanel.displayName = "CompareExpedientePanel";
