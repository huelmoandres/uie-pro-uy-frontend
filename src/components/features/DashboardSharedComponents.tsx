import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { InfoButton } from "@components/ui";
import { formatDate, stripHtml } from "@utils/formatters";
import type {
  IDeadlineSummary,
  IDormantExpediente,
  IRecentMovement,
} from "@app-types/dashboard.types";

export function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
      <Text style={{ color }} className="text-2xl font-sans-bold">
        {value}
      </Text>
      <Text className="text-[10px] font-sans text-slate-400 mt-0.5 leading-tight">
        {label}
      </Text>
    </View>
  );
}

export function SectionTitle({
  label,
  icon: Icon,
  info,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  info?: { title: string; description: string };
}) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-6">
      <Icon size={14} color="#94A3B8" />
      <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-slate-400 flex-1">
        {label}
      </Text>
      {info && (
        <InfoButton
          title={info.title}
          description={info.description}
          size={14}
        />
      )}
    </View>
  );
}

export function DeadlineRow({ item }: { item: IDeadlineSummary }) {
  const isUrgent = item.daysRemaining <= 3;
  return (
    <View
      className={`rounded-[16px] border p-3 mb-2 ${isUrgent ? "border-red-200 bg-red-50/60 dark:border-red-800/30 dark:bg-red-900/10" : "border-amber-200 bg-amber-50/60 dark:border-amber-800/30 dark:bg-amber-900/10"}`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">
            {item.expedienteIue}
          </Text>
          <Text
            className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300 mt-0.5"
            numberOfLines={1}
          >
            {stripHtml(item.expedienteCaratula) || "Sin carátula"}
          </Text>
          <Text
            className="text-[10px] font-sans text-slate-400 mt-0.5"
            numberOfLines={1}
          >
            {item.detectedText}
          </Text>
        </View>
        <View
          className={`rounded-full px-2 py-1 ${isUrgent ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}
        >
          <Text
            className={`text-[11px] font-sans-bold ${isUrgent ? "text-red-500" : "text-amber-600"}`}
          >
            {item.daysRemaining <= 0 ? "Hoy" : `${item.daysRemaining}d`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function DormantRow({ item }: { item: IDormantExpediente }) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3 mb-2 active:opacity-70"
      onPress={() =>
        router.push(`/expedientes/${item.iue.replace("/", ":")}` as any)
      }
    >
      <View className="flex-1 mr-3">
        <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">
          {item.iue}
        </Text>
        <Text
          className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300 mt-0.5"
          numberOfLines={1}
        >
          {stripHtml(item.caratula) || "Sin carátula"}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        <Text className="text-[10px] font-sans-bold text-red-400">
          {item.daysSinceLastActivity}d sin actividad
        </Text>
        <Text className="text-[10px] font-sans text-slate-400">
          {formatDate(item.lastActivityDate)}
        </Text>
      </View>
    </Pressable>
  );
}

export function RecentMovementRow({ item }: { item: IRecentMovement }) {
  const color =
    item.priority === "HIGH"
      ? "#B89146"
      : item.priority === "MEDIUM"
        ? "#3B82F6"
        : "#94A3B8";
  return (
    <Pressable
      className="flex-row items-start gap-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3 mb-2 active:opacity-70"
      onPress={() =>
        router.push(
          `/expedientes/${item.expedienteIue.replace("/", ":")}` as any,
        )
      }
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginTop: 5,
        }}
      />
      <View className="flex-1">
        <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-wide">
          {item.expedienteIue}
        </Text>
        <Text
          className="text-[12px] font-sans-semi text-slate-700 dark:text-slate-300"
          numberOfLines={1}
        >
          {item.tipo}
        </Text>
        <Text className="text-[10px] font-sans text-slate-400 mt-0.5">
          {formatDate(item.fecha)}
        </Text>
      </View>
      <ChevronRight size={14} color="#CBD5E1" />
    </Pressable>
  );
}
