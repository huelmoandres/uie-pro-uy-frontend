import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Star,
} from "lucide-react-native";
import { InfoButton } from "@components/ui";
import { INFO_HINTS } from "@/constants/InfoHints";
import type { TabFilter } from "@hooks/useExpedientesScreen";

interface ExpedientesHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  onAddPress: () => void;
  onFilterPress: () => void;
  hasActiveFilters: boolean;
  totalItems?: number;
  freeQuotaLabel?: string;
}

export function ExpedientesHeader({
  searchText,
  onSearchChange,
  activeTab,
  onTabChange,
  onAddPress,
  onFilterPress,
  hasActiveFilters,
  totalItems,
  freeQuotaLabel,
}: ExpedientesHeaderProps) {
  return (
    <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
            Mi Monitor
          </Text>
          <Text className="text-[22px] font-sans-bold text-slate-900 dark:text-white mt-0.5">
            Expedientes
          </Text>
        </View>
        <InfoButton
          title={INFO_HINTS.expedientesList.title}
          description={INFO_HINTS.expedientesList.description}
          size={18}
        />
      </View>

      <View className="mt-5 flex-row gap-2.5">
        <View className="flex-1 h-11 flex-row items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5 dark:border-white/10 dark:bg-white/5">
          <Search size={16} color="#94A3B8" />
          <TextInput
            className="flex-1 h-full px-2.5 font-sans text-[14px] text-slate-900 dark:text-white"
            placeholder="Buscar IUE o carátula..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-sm shadow-accent/20 active:scale-[0.95]"
          onPress={onAddPress}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-[0.95] relative"
          onPress={onFilterPress}
        >
          <SlidersHorizontal size={18} color="#64748B" />
          {hasActiveFilters ? (
            <View className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger border border-white dark:border-primary" />
          ) : null}
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <Pressable
          onPress={() => onTabChange("all")}
          className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 border active:opacity-70 ${
            activeTab === "all"
              ? "bg-primary border-primary"
              : "bg-transparent border-slate-200 dark:border-white/10"
          }`}
        >
          <Text
            className={`text-[12px] font-sans-semi ${activeTab === "all" ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
          >
            Todos
          </Text>
          {totalItems !== undefined && activeTab === "all" && (
            <View className="bg-white/20 rounded-full px-1.5 py-0.5">
              <Text className="text-[10px] font-sans-bold text-white">
                {totalItems}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={() => onTabChange("pinned")}
          className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 border active:opacity-70 ${
            activeTab === "pinned"
              ? "bg-accent border-accent"
              : "bg-transparent border-slate-200 dark:border-white/10"
          }`}
        >
          <Star
            size={11}
            color={activeTab === "pinned" ? "#FFFFFF" : "#B89146"}
            fill={activeTab === "pinned" ? "#FFFFFF" : "transparent"}
          />
          <Text
            className={`text-[12px] font-sans-semi ${activeTab === "pinned" ? "text-white" : "text-accent"}`}
          >
            Favoritos
          </Text>
          {totalItems !== undefined && activeTab === "pinned" && (
            <View className="bg-white/20 rounded-full px-1.5 py-0.5">
              <Text className="text-[10px] font-sans-bold text-white">
                {totalItems}
              </Text>
            </View>
          )}
        </Pressable>
        <InfoButton
          title={INFO_HINTS.todosFavoritos.title}
          description={INFO_HINTS.todosFavoritos.description}
          size={14}
        />
      </View>

      {freeQuotaLabel ? (
        <View className="mt-3 self-start rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1.5 dark:border-amber-500/40 dark:bg-amber-500/10">
          <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-amber-700 dark:text-amber-400">
            {freeQuotaLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
