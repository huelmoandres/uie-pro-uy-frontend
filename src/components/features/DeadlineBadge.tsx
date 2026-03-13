import React from "react";
import { Text, View } from "react-native";
import { Clock } from "lucide-react-native";
import type { IDeadlineDetectionResult } from "@app-types/expediente.types";

interface Props {
  deadline: IDeadlineDetectionResult;
}

const TYPE_LABEL: Record<string, string> = {
  BUSINESS_DAYS: "días hábiles",
  CALENDAR_DAYS: "días corridos",
  UNSPECIFIED: "días",
};

export const DeadlineBadge = React.memo(({ deadline }: Props) => {
  if (!deadline.hasDeadline || !deadline.days) return null;

  const typeLabel = TYPE_LABEL[deadline.type ?? "UNSPECIFIED"] ?? "días";

  return (
    <View className="mt-2 flex-row items-center gap-1.5 self-start rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800/30 dark:bg-amber-900/20">
      <Clock size={11} color="#F59E0B" />
      <Text className="text-[11px] font-sans-bold text-amber-600 dark:text-amber-400">
        Plazo: {deadline.days} {typeLabel}
      </Text>
    </View>
  );
});
