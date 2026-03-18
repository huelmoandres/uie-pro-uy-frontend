import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Package } from "lucide-react-native";
import type { IInternalGroup, IMovement } from "@app-types/expediente.types";
import { formatDate } from "@utils/formatters";

interface Props {
  group: IInternalGroup;
  isFirst: boolean;
  isLast: boolean;
}

export const InternalGroupItem = React.memo(
  ({ group, isFirst, isLast }: Props) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <View>
        <View className="flex-row">
          {/* Timeline spine */}
          <View className="items-center" style={{ width: 28 }}>
            <View
              className={`w-[2px] flex-1 ${isFirst ? "bg-transparent" : "bg-slate-100 dark:bg-white/5"}`}
              style={{ maxHeight: 12 }}
            />
            <View className="h-3 w-3 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-primary" />
            <View
              className={`w-[2px] flex-1 ${isLast && !expanded ? "bg-transparent" : "bg-slate-100 dark:bg-white/5"}`}
            />
          </View>

          {/* Collapsed pill */}
          <Pressable
            className="flex-1 ml-3 pb-4 active:opacity-70"
            onPress={() => setExpanded((v) => !v)}
          >
            <View className="flex-row items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-white/5 dark:bg-white/5">
              <View className="flex-row items-center gap-2">
                <Package size={12} color="#94A3B8" />
                <Text className="text-[11px] font-sans-semi text-slate-400 dark:text-slate-500">
                  {group.count} trámite{group.count !== 1 ? "s" : ""} interno
                  {group.count !== 1 ? "s" : ""}
                </Text>
              </View>
              {expanded ? (
                <ChevronUp size={12} color="#94A3B8" />
              ) : (
                <ChevronDown size={12} color="#94A3B8" />
              )}
            </View>
          </Pressable>
        </View>

        {/* Expanded individual movements */}
        {expanded &&
          group.movements.map((m: IMovement, idx: number) => (
            <View key={`${m.orden}-${idx}`} className="flex-row">
              <View className="items-center" style={{ width: 28 }}>
                <View className="w-[2px] flex-1 bg-slate-100 dark:bg-white/5" />
                <View className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <View
                  className={`w-[2px] flex-1 ${idx === group.movements.length - 1 && isLast ? "bg-transparent" : "bg-slate-100 dark:bg-white/5"}`}
                />
              </View>
              <View className="flex-1 ml-3 pb-3">
                <Text className="text-[12px] font-sans-semi text-slate-500 dark:text-slate-400">
                  {m.tipo}
                </Text>
                <Text className="text-[10px] font-sans text-slate-400 mt-0.5">
                  {formatDate(m.fecha)}
                </Text>
              </View>
            </View>
          ))}
      </View>
    );
  },
);
InternalGroupItem.displayName = "InternalGroupItem";
