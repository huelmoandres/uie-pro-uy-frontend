import React from "react";
import { View } from "react-native";
import { Skeleton } from "@components/ui";

export function ExpedienteSkeleton() {
  return (
    <View className="mb-4 overflow-hidden rounded-[28px] bg-white p-6 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5">
      <View className="flex-row items-center mb-4">
        <Skeleton width={48} height={48} borderRadius={16} />
        <View className="ml-4">
          <Skeleton width={100} height={12} className="mb-2" />
          <Skeleton width={150} height={16} />
        </View>
      </View>
      <Skeleton width="100%" height={40} borderRadius={12} className="mb-4" />
      <View className="flex-row justify-between">
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}
