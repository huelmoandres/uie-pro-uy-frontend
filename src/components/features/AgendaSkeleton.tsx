import React from "react";
import { View } from "react-native";
import { Skeleton } from "@components/ui";

/**
 * Skeleton que imita la estructura de la agenda (secciones colapsables, items).
 * Cumple ai-rules: no usar Spinners en pantallas principales.
 */
export function AgendaSkeleton() {
  return (
    <View>
      {/* Section header */}
      <View className="flex-row items-center gap-2 mx-4 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 mb-2">
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width={100} height={12} borderRadius={4} />
        <Skeleton width={24} height={16} borderRadius={8} className="ml-auto" />
      </View>
      {/* Items */}
      <View className="px-4 gap-2">
        <View className="rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3">
          <Skeleton width="50%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={14} borderRadius={4} className="mt-2" />
          <Skeleton width={36} height={20} borderRadius={8} className="mt-2 self-end" />
        </View>
        <View className="rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3">
          <Skeleton width="50%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={14} borderRadius={4} className="mt-2" />
          <Skeleton width={36} height={20} borderRadius={8} className="mt-2 self-end" />
        </View>
        <View className="rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3">
          <Skeleton width="50%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={14} borderRadius={4} className="mt-2" />
          <Skeleton width={36} height={20} borderRadius={8} className="mt-2 self-end" />
        </View>
      </View>
    </View>
  );
}
