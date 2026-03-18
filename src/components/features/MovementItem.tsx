import React from "react";
import { Text, View } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import type {
  IMovement,
  MovementCategory,
  MovementPriority,
} from "@app-types/expediente.types";
import { formatDate, getMovementTypeLabel } from "@utils/formatters";
import { DecreeViewer } from "./DecreeViewer";
import type { IDecreePdfContext } from "@utils/pdf-template";

interface Props {
  item: IMovement;
  isFirst: boolean;
  isLast: boolean;
  /** Contexto opcional para exportar el decreto a PDF con datos del expediente */
  decreeContext?: IDecreePdfContext;
  /** Si true, muestra el decreto como chip compacto en lugar del botón completo */
  compact?: boolean;
}

const DOT_COLOR: Record<MovementPriority, string> = {
  HIGH: "bg-accent",
  MEDIUM: "bg-blue-400",
  LOW: "bg-slate-300 dark:bg-slate-600",
};

const CATEGORY_CHIP: Record<
  MovementCategory,
  { label: string; color: string }
> = {
  DECREE: { label: "Decreto", color: "#B89146" },
  NOTIFICATION: { label: "Notificación", color: "#3B82F6" },
  WRITING: { label: "Escrito", color: "#8B5CF6" },
  AUDIENCE: { label: "Audiencia", color: "#10B981" },
  INTERNAL: { label: "Interno", color: "#94A3B8" },
};

export const MovementItem = React.memo(
  ({ item, isFirst, isLast, decreeContext, compact }: Props) => {
    const priority = item.classification?.priority ?? "LOW";
    const category = item.classification?.type;
    const dotColor = DOT_COLOR[priority];
    const chip = category ? CATEGORY_CHIP[category] : null;

    return (
      <View className="flex-row">
        {/* Timeline spine */}
        <View className="items-center" style={{ width: 28 }}>
          <View
            className={`w-[2px] flex-1 ${isFirst ? "bg-transparent" : "bg-slate-100 dark:bg-white/5"}`}
            style={{ maxHeight: 12 }}
          />
          <View
            className={`h-3 w-3 rounded-full border-2 border-white dark:border-primary ${dotColor}`}
          />
          <View
            className={`w-[2px] flex-1 ${isLast ? "bg-transparent" : "bg-slate-100 dark:bg-white/5"}`}
          />
        </View>

        {/* Content */}
        <View className={`flex-1 ml-3 ${isLast ? "pb-2" : "pb-5"}`}>
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className={`flex-1 text-[13px] font-sans-semi leading-tight ${priority === "HIGH" ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
              numberOfLines={2}
            >
              {getMovementTypeLabel(item.tipo)}
            </Text>
            <View className="flex-row items-center gap-1 flex-shrink-0">
              <Clock size={10} color="#94A3B8" />
              <Text className="text-[10px] font-sans text-slate-400">
                {formatDate(item.fecha)}
              </Text>
            </View>
          </View>

          <View className="mt-1 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1 flex-1">
              <MapPin size={10} color="#94A3B8" />
              <Text
                className="text-[11px] font-sans text-slate-400 dark:text-slate-500 flex-1"
                numberOfLines={1}
              >
                {item.sede}
              </Text>
            </View>
            {chip && (
              <View className="flex-row items-center gap-1 flex-shrink-0">
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: chip.color,
                  }}
                />
                <Text
                  style={{ color: chip.color }}
                  className="text-[9px] font-sans-bold uppercase tracking-wide"
                >
                  {chip.label}
                </Text>
              </View>
            )}
          </View>

          {item.decree &&
            (compact ? (
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <View className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                  <Text className="text-[10px] font-sans-semi text-slate-600 dark:text-slate-400">
                    {item.decree.nroDecreto
                      ? `Decreto ${item.decree.nroDecreto}`
                      : "Decreto"}
                  </Text>
                </View>
              </View>
            ) : (
              <DecreeViewer
                decree={item.decree}
                decreeContext={decreeContext}
              />
            ))}
        </View>
      </View>
    );
  },
);
MovementItem.displayName = "MovementItem";
