import React from "react";
import { Pressable, Text, View } from "react-native";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Bell,
  Lock,
} from "lucide-react-native";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";
import { formatDate, stripHtml } from "@utils/formatters";
import { navigateToExpediente } from "@utils/navigation";

interface Props {
  item: IAgendaItem;
  onAddReminder?: (item: IAgendaItem) => void;
  /** false = muestra candado (freemium); el padre debe interceptar y mostrar paywall */
  hasPremiumAccess?: boolean;
}

function getUrgencyConfig(
  daysRemaining: number,
  status: IAgendaItem["status"],
) {
  if (status === "EXPIRED")
    return {
      bg: "bg-slate-50 dark:bg-slate-800/30",
      border: "border-slate-200 dark:border-slate-700",
      dot: "#94A3B8",
      badge: "bg-slate-100 dark:bg-slate-700/40",
      badgeText: "text-slate-500",
      icon: XCircle,
      iconColor: "#94A3B8",
      label: "Vencido",
    };
  if (status === "CLOSED")
    return {
      bg: "bg-emerald-50/60 dark:bg-emerald-900/10",
      border: "border-emerald-100 dark:border-emerald-800/30",
      dot: "#10B981",
      badge: "bg-emerald-50 dark:bg-emerald-900/20",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle,
      iconColor: "#10B981",
      label: "Cerrado",
    };
  if (daysRemaining <= 0)
    return {
      bg: "bg-red-50/60 dark:bg-red-900/10",
      border: "border-red-200 dark:border-red-800/40",
      dot: "#EF4444",
      badge: "bg-red-50 dark:bg-red-900/20",
      badgeText: "text-red-500",
      icon: AlertTriangle,
      iconColor: "#EF4444",
      label: "Hoy",
    };
  if (daysRemaining <= 3)
    return {
      bg: "bg-red-50/60 dark:bg-red-900/10",
      border: "border-red-200 dark:border-red-800/40",
      dot: "#EF4444",
      badge: "bg-red-50 dark:bg-red-900/20",
      badgeText: "text-red-500",
      icon: AlertTriangle,
      iconColor: "#EF4444",
      label: `${daysRemaining}d`,
    };
  if (daysRemaining <= 7)
    return {
      bg: "bg-amber-50/60 dark:bg-amber-900/10",
      border: "border-amber-200 dark:border-amber-800/40",
      dot: "#F59E0B",
      badge: "bg-amber-50 dark:bg-amber-900/20",
      badgeText: "text-amber-600 dark:text-amber-400",
      icon: Clock,
      iconColor: "#F59E0B",
      label: `${daysRemaining}d`,
    };
  return {
    bg: "bg-white dark:bg-white/5",
    border: "border-slate-100 dark:border-white/5",
    dot: "#B89146",
    badge: "bg-accent/10",
    badgeText: "text-accent",
    icon: Clock,
    iconColor: "#B89146",
    label: `${daysRemaining}d`,
  };
}

const DEADLINE_TYPE_LABEL: Record<string, string> = {
  BUSINESS_DAYS: "días hábiles",
  CALENDAR_DAYS: "días corridos",
  UNSPECIFIED: "días",
};

export const AgendaItemCard = React.memo(
  ({ item, onAddReminder, hasPremiumAccess = true }: Props) => {
    const config = getUrgencyConfig(item.daysRemaining, item.status);
    const IconComponent = config.icon;
    const typeLabel = DEADLINE_TYPE_LABEL[item.deadlineType] ?? "días";
    const caratula = item.caratula ? stripHtml(item.caratula) : null;
    const canAddReminder = item.status === "OPEN" && onAddReminder;

    return (
      <Pressable
        onPress={() => navigateToExpediente(item.iue)}
        className={`rounded-[18px] border p-4 mb-2.5 active:opacity-75 ${config.bg} ${config.border}`}
      >
        {/* Header row */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-wide text-accent mb-0.5">
              {item.iue}
            </Text>
            <Text
              className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300 leading-tight"
              numberOfLines={2}
            >
              {caratula || "Sin carátula disponible"}
            </Text>
          </View>
          <View className="items-end gap-1.5">
            {canAddReminder && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onAddReminder(item);
                }}
                className="flex-row items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 active:opacity-70 mb-1.5"
              >
                <Bell size={15} color="#B89146" />
                <Text className="text-[11px] font-sans-semi text-accent">
                  Recordatorio
                </Text>
                {!hasPremiumAccess && <Lock size={12} color="#94A3B8" />}
              </Pressable>
            )}
            <View
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 shrink-0 ${config.badge}`}
            >
              <IconComponent size={11} color={config.iconColor} />
              <Text
                className={`text-[11px] font-sans-bold ${config.badgeText}`}
              >
                {config.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Detected text snippet */}
        <View className="mt-3 rounded-xl bg-white/60 dark:bg-white/5 px-3 py-2">
          <Text
            className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed"
            numberOfLines={2}
          >
            {item.detectedText}
          </Text>
        </View>

        {/* Footer row */}
        <View className="mt-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: config.dot,
              }}
            />
            <Text className="text-[10px] font-sans-semi text-slate-400">
              {item.days} {typeLabel}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[10px] font-sans text-slate-400">
              Vence {formatDate(item.dueDate)}
            </Text>
            <ChevronRight size={10} color="#CBD5E1" />
          </View>
        </View>
      </Pressable>
    );
  },
);
AgendaItemCard.displayName = "AgendaItemCard";
