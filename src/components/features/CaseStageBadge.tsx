import React from "react";
import { Text, View } from "react-native";
import type { CaseStage } from "@app-types/expediente.types";

interface Props {
  stage: CaseStage;
}

const STAGE_CONFIG: Record<
  CaseStage,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  FILING: {
    label: "Inicio",
    dot: "#94A3B8",
    text: "text-slate-500",
    bg: "bg-slate-100 dark:bg-slate-700/30",
    border: "border-slate-200 dark:border-slate-700",
  },
  PRELIMINARY: {
    label: "Audiencia Preliminar",
    dot: "#3B82F6",
    text: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-100 dark:border-blue-800/30",
  },
  EVIDENCE: {
    label: "Etapa Probatoria",
    dot: "#F59E0B",
    text: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-100 dark:border-amber-800/30",
  },
  PLEADINGS: {
    label: "Alegatos",
    dot: "#F97316",
    text: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-100 dark:border-orange-800/30",
  },
  JUDGMENT: {
    label: "Sentencia",
    dot: "#10B981",
    text: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/30",
  },
  APPEAL: {
    label: "Recurso / Apelación",
    dot: "#EF4444",
    text: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-100 dark:border-red-800/30",
  },
  ENFORCEMENT: {
    label: "Ejecución",
    dot: "#8B5CF6",
    text: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-100 dark:border-violet-800/30",
  },
};

export const CaseStageBadge = React.memo(({ stage }: Props) => {
  const config = STAGE_CONFIG[stage];
  if (!config) return null;

  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1 ${config.bg} ${config.border}`}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dot,
        }}
      />
      <Text
        className={`text-[10px] font-sans-bold uppercase tracking-wide ${config.text}`}
      >
        {config.label}
      </Text>
    </View>
  );
});
