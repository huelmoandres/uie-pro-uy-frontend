import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { X, SlidersHorizontal, ArrowDownUp, Lock } from "lucide-react-native";
import { modalBottomSheetStyles } from "@utils/modalStyles";
import type { IExpedientesQuery } from "@app-types/expediente.types";
import { useTags } from "@hooks";
import { useModalKeyboardDismiss } from "@hooks/useModalKeyboardDismiss";
import { TagBadge } from "@components/ui";

interface Props {
  visible: boolean;
  currentFilters: Partial<IExpedientesQuery>;
  onClose: () => void;
  onApply: (filters: Partial<IExpedientesQuery>) => void;
  hasPremiumAccess?: boolean;
  onPremiumTagsRequired?: () => void;
}

export const ExpedientesFilterModal = React.memo(
  ({
    visible,
    currentFilters,
    onClose,
    onApply,
    hasPremiumAccess = true,
    onPremiumTagsRequired,
  }: Props) => {
    const { data: tags = [] } = useTags();

    // Local state to draft changes before applying
    const [draft, setDraft] =
      useState<Partial<IExpedientesQuery>>(currentFilters);

    // Sync draft with current filters when opened
    useEffect(() => {
      if (visible) {
        setDraft(currentFilters);
      }
    }, [visible, currentFilters]);

    useModalKeyboardDismiss(visible);

    const updateDraft = (
      key: keyof IExpedientesQuery,
      value: IExpedientesQuery[keyof IExpedientesQuery],
    ) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const toggleTagFilter = (tagId: string) => {
      setDraft((prev) => {
        const current = prev.tagIds ?? [];
        const isSelected = current.includes(tagId);
        return {
          ...prev,
          tagIds: isSelected
            ? current.filter((id) => id !== tagId)
            : [...current, tagId],
        };
      });
    };

    const handleApply = () => {
      onApply({
        ...draft,
        // Clean up empty strings to undefined to not send them
        sede: draft.sede?.trim() || undefined,
        anio: draft.anio ? Number(draft.anio) : undefined,
        tagIds:
          hasPremiumAccess && draft.tagIds?.length ? draft.tagIds : undefined,
      });
      onClose();
    };

    const handleClear = () => {
      setDraft({
        limit: draft.limit, // Preserve pagination size
        order: "desc",
        orderBy: "lastSyncAt",
      });
    };

    return (
      <Modal
        transparent
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={modalBottomSheetStyles.overlay}>
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <View style={modalBottomSheetStyles.backdrop} />
          </Pressable>

          {/* Sheet */}
          <View className="w-full h-[95%] rounded-t-[32px] bg-white dark:bg-surface-dark border border-b-0 border-slate-100 dark:border-white/5 overflow-hidden flex-col">
            {/* Handle */}
            <View className="items-center pt-4 pb-2">
              <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-primary/10 dark:bg-accent/10">
                  <SlidersHorizontal size={18} color="#B89146" />
                </View>
                <Text className="text-lg font-sans-bold text-slate-900 dark:text-white">
                  Filtros
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
              >
                <X size={15} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Scrollable Form */}
            <ScrollView
              className="px-6 py-5 flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Order & OrderBy */}
              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Ordenación
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {(
                  [
                    { value: "lastSyncAt", label: "Última Sincronización" },
                    { value: "iue", label: "IUE" },
                    { value: "createdAt", label: "Expediente Agregado" },
                  ] as const
                ).map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateDraft("orderBy", opt.value)}
                    className={`px-3 py-2 rounded-xl border flex-row items-center gap-1 ${
                      draft.orderBy === opt.value
                        ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                        : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-sans-semi ${draft.orderBy === opt.value ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Dirección
              </Text>
              <View className="flex-row gap-2 mb-6">
                <Pressable
                  onPress={() => updateDraft("order", "desc")}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${
                    draft.order === "desc"
                      ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                      : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                  }`}
                >
                  <ArrowDownUp
                    size={14}
                    color={draft.order === "desc" ? "#FFFFFF" : "#94A3B8"}
                  />
                  <Text
                    className={`ml-2 text-[13px] font-sans-semi ${draft.order === "desc" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    Descendente
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => updateDraft("order", "asc")}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${
                    draft.order === "asc"
                      ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                      : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                  }`}
                >
                  <ArrowDownUp
                    size={14}
                    color={draft.order === "asc" ? "#FFFFFF" : "#94A3B8"}
                    style={{ transform: [{ scaleY: -1 }] }}
                  />
                  <Text
                    className={`ml-2 text-[13px] font-sans-semi ${draft.order === "asc" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    Ascendente
                  </Text>
                </Pressable>
              </View>

              {/* Sede */}
              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Sede Judicial
              </Text>
              <TextInput
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-sans text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white mb-6"
                placeholder="Ej: Montevideo"
                placeholderTextColor="#94A3B8"
                value={draft.sede || ""}
                onChangeText={(text) => updateDraft("sede", text)}
              />

              {/* Anio */}
              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Año
              </Text>
              <TextInput
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-sans text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white mb-6"
                placeholder="Ej: 2024"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                value={draft.anio ? String(draft.anio) : ""}
                onChangeText={(text) => updateDraft("anio", text)}
              />

              {/* Tags (premium) */}
              {!hasPremiumAccess && (
                <>
                  <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                    Etiquetas
                  </Text>
                  <Pressable
                    onPress={() => onPremiumTagsRequired?.()}
                    className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 px-4 py-3 mb-10 active:opacity-70"
                  >
                    <Lock size={12} color="#64748B" />
                    <Text className="text-[13px] font-sans-semi text-slate-600 dark:text-slate-300 flex-1">
                      Filtrar por etiquetas es una función IUE Pro
                    </Text>
                  </Pressable>
                </>
              )}
              {hasPremiumAccess && tags.length > 0 && (
                <>
                  <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                    Etiquetas
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-10">
                    {tags.map((tag) => {
                      const isActive = draft.tagIds?.includes(tag.id) ?? false;
                      return (
                        <Pressable
                          key={tag.id}
                          onPress={() => toggleTagFilter(tag.id)}
                          className={`rounded-full border-2 active:opacity-70 ${isActive ? "opacity-100" : "opacity-50"}`}
                          style={
                            isActive
                              ? { borderColor: tag.color }
                              : { borderColor: "transparent" }
                          }
                        >
                          <TagBadge tag={tag} size="sm" />
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View className="flex-row items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <Pressable
                onPress={handleClear}
                className="px-5 py-3 active:opacity-70"
              >
                <Text className="text-sm font-sans-semi text-slate-500 dark:text-slate-400">
                  Limpiar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                className="px-6 py-3 ml-2 rounded-xl bg-primary dark:bg-accent active:opacity-80 disabled:opacity-50"
              >
                <Text className="text-sm font-sans-bold text-white dark:text-primary">
                  Aplicar Filtros
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);
ExpedientesFilterModal.displayName = "ExpedientesFilterModal";

