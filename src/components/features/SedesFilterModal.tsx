import React, { useState, useEffect, useCallback } from "react";
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
import { X, SlidersHorizontal } from "lucide-react-native";
import { useModalKeyboardDismiss } from "@hooks/useModalKeyboardDismiss";
import { modalBottomSheetStyles } from "@utils/modalStyles";
import { dismissKeyboard } from "@utils/keyboard";
import type { IVenuesQuery, IVenueFilters } from "@app-types/venue.types";

interface Props {
  visible: boolean;
  currentFilters: IVenuesQuery;
  filtersData: IVenueFilters | undefined;
  onClose: () => void;
  onApply: (filters: Partial<IVenuesQuery>) => void;
}

export const SedesFilterModal = React.memo(
  ({ visible, currentFilters, filtersData, onClose, onApply }: Props) => {
    const [draft, setDraft] = useState<Partial<IVenuesQuery>>(currentFilters);

    useEffect(() => {
      if (visible) {
        setDraft(currentFilters);
      }
    }, [visible, currentFilters]);

    useModalKeyboardDismiss(visible);

    const closeModal = useCallback(() => {
      dismissKeyboard();
      onClose();
    }, [onClose]);

    const updateDraft = (key: keyof IVenuesQuery, value: unknown) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
      onApply({
        ...draft,
        search: draft.search?.trim() || undefined,
        page: 1,
      });
      dismissKeyboard();
      onClose();
    };

    const handleClear = () => {
      setDraft({
        page: 1,
        limit: draft.limit ?? 20,
      });
    };

    const departments = filtersData?.departments ?? [];
    const subjects = filtersData?.subjects ?? [];
    const selectedDept = departments.find((d) => d.id === draft.departmentId);
    const cities = selectedDept?.cities ?? [];

    return (
      <Modal
        transparent
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={modalBottomSheetStyles.overlay}>
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
            onPress={closeModal}
          >
            <View style={modalBottomSheetStyles.backdrop} />
          </Pressable>

          <View
            style={{ zIndex: 1 }}
            className="w-full h-[95%] rounded-t-[32px] bg-white dark:bg-surface-dark border border-b-0 border-slate-100 dark:border-white/5 overflow-hidden flex-col"
          >
            <View className="items-center pt-4 pb-2">
              <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
            </View>

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
                onPress={closeModal}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
              >
                <X size={15} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 py-5 flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Búsqueda
              </Text>
              <TextInput
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-sans text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white mb-6"
                placeholder="Nombre o dirección..."
                placeholderTextColor="#94A3B8"
                value={draft.search ?? ""}
                onChangeText={(text) => updateDraft("search", text)}
              />

              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Departamento
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {departments.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => {
                      updateDraft(
                        "departmentId",
                        draft.departmentId === d.id ? undefined : d.id,
                      );
                      updateDraft("cityId", undefined);
                    }}
                    className={`px-3 py-2 rounded-xl border flex-row items-center ${
                      draft.departmentId === d.id
                        ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                        : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-sans-semi ${
                        draft.departmentId === d.id
                          ? "text-white dark:text-primary"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {d.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {cities.length > 0 && (
                <>
                  <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                    Ciudad
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {cities.map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() =>
                          updateDraft(
                            "cityId",
                            draft.cityId === c.id ? undefined : c.id,
                          )
                        }
                        className={`px-3 py-2 rounded-xl border flex-row items-center ${
                          draft.cityId === c.id
                            ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                            : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                        }`}
                      >
                        <Text
                          className={`text-[13px] font-sans-semi ${
                            draft.cityId === c.id
                              ? "text-white dark:text-primary"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
                Materia
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-10">
                {subjects.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      updateDraft(
                        "subjectId",
                        draft.subjectId === s.id ? undefined : s.id,
                      )
                    }
                    className={`px-3 py-2 rounded-xl border flex-row items-center ${
                      draft.subjectId === s.id
                        ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                        : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-sans-semi ${
                        draft.subjectId === s.id
                          ? "text-white dark:text-primary"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {s.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

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
SedesFilterModal.displayName = "SedesFilterModal";
