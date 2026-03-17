import React from "react";
import { View } from "react-native";
import { Skeleton } from "@components/ui";

/**
 * Skeleton que imita la estructura del Dashboard (StatCards, secciones).
 * Cumple ai-rules: no usar Spinners en pantallas principales.
 */
export function DashboardSkeleton() {
  return (
    <View>
      {/* Stats row — 4 StatCards en grid 2x2 */}
      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
          <Skeleton width={48} height={28} borderRadius={8} />
          <Skeleton width={80} height={10} borderRadius={4} className="mt-2" />
        </View>
        <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
          <Skeleton width={48} height={28} borderRadius={8} />
          <Skeleton width={80} height={10} borderRadius={4} className="mt-2" />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
          <Skeleton width={48} height={28} borderRadius={8} />
          <Skeleton width={80} height={10} borderRadius={4} className="mt-2" />
        </View>
        <View className="flex-1 rounded-[20px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4">
          <Skeleton width={48} height={28} borderRadius={8} />
          <Skeleton width={80} height={10} borderRadius={4} className="mt-2" />
        </View>
      </View>

      {/* Section title + rows */}
      <View className="mt-6 mb-3">
        <Skeleton width={120} height={12} borderRadius={4} />
      </View>
      <View className="gap-2">
        <View className="rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3">
          <Skeleton width="60%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={14} borderRadius={4} className="mt-2" />
          <Skeleton width={40} height={20} borderRadius={8} className="mt-2 self-end" />
        </View>
        <View className="rounded-[16px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-3">
          <Skeleton width="60%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={14} borderRadius={4} className="mt-2" />
          <Skeleton width={40} height={20} borderRadius={8} className="mt-2 self-end" />
        </View>
      </View>
    </View>
  );
}
