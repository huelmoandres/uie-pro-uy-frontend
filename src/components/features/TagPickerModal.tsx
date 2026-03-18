import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { X, Tag, CheckCircle2, Circle } from "lucide-react-native";
import { useTags } from "@hooks/useTags";
import { useTagMutations } from "@hooks/useTagMutations";
import { TagBadge } from "@components/ui/TagBadge";

interface Props {
  visible: boolean;
  iue: string;
  /** Tags ya asignadas al expediente para mostrar el estado seleccionado. */
  assignedTagIds: string[];
  onClose: () => void;
}

/**
 * Modal para asignar o desasignar etiquetas existentes a un expediente.
 * Usa un "draft" local y al presionar "Aplicar" envía las mutaciones necesarias en batch.
 */
export const TagPickerModal = React.memo(
  ({ visible, iue, assignedTagIds, onClose }: Props) => {
    const { data: tags = [], isLoading } = useTags();
    const { assignTag, unassignTag } = useTagMutations();

    // Draft local de tags seleccionados
    const [draftTagIds, setDraftTagIds] = useState<string[]>(assignedTagIds);

    // Sincronizar draft cuando se abre el modal
    useEffect(() => {
      if (visible) {
        setDraftTagIds(assignedTagIds);
      }
    }, [visible, assignedTagIds]);

    const handleToggle = useCallback((tagId: string) => {
      setDraftTagIds((prev) =>
        prev.includes(tagId)
          ? prev.filter((id) => id !== tagId)
          : [...prev, tagId],
      );
    }, []);

    const hasChanges = useMemo(() => {
      if (draftTagIds.length !== assignedTagIds.length) return true;
      const sortedDraft = [...draftTagIds].sort();
      const sortedAssigned = [...assignedTagIds].sort();
      return sortedDraft.some((id, index) => id !== sortedAssigned[index]);
    }, [draftTagIds, assignedTagIds]);

    const handleApply = useCallback(() => {
      // Calcular tags a agregar
      const toAssign = draftTagIds.filter((id) => !assignedTagIds.includes(id));
      // Calcular tags a remover
      const toRemove = assignedTagIds.filter((id) => !draftTagIds.includes(id));

      // Enviar mutaciones. Al ser optimistic updates con TanStack,
      // la UI se actualizará casi al instante y resolvemos promesas en paralelo
      toAssign.forEach((tagId) => assignTag.mutate({ iue, tagId }));
      toRemove.forEach((tagId) => unassignTag.mutate({ iue, tagId }));

      onClose();
    }, [iue, draftTagIds, assignedTagIds, assignTag, unassignTag, onClose]);

    const isPending = assignTag.isPending || unassignTag.isPending;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View className="bg-white dark:bg-slate-900 rounded-t-[28px] overflow-hidden shadow-2xl">
            {/* Handle */}
            <View className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 self-center mt-3" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <View className="flex-row items-center gap-2">
                <Tag size={16} color="#B89146" />
                <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white">
                  Asignar Etiquetas
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                className="active:opacity-60"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              className="max-h-72"
              contentContainerClassName="px-5 py-4 gap-2"
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#B89146"
                  className="py-6"
                />
              ) : tags.length === 0 ? (
                <View className="items-center py-8 gap-2">
                  <Tag size={28} color="#CBD5E1" />
                  <Text className="text-[13px] font-sans text-slate-400 text-center">
                    Todavía no creaste etiquetas.{"\n"}Creá una desde
                    Configuración.
                  </Text>
                </View>
              ) : (
                tags.map((tag) => {
                  const isAssigned = draftTagIds.includes(tag.id);
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => handleToggle(tag.id)}
                      disabled={isPending}
                      className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl border active:opacity-70 ${
                        isAssigned
                          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          : "border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <TagBadge tag={tag} size="sm" />
                      </View>
                      <View>
                        {isAssigned ? (
                          <CheckCircle2 size={20} color={tag.color} />
                        ) : (
                          <Circle size={20} color="#CBD5E1" />
                        )}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {/* Footer / Botón Aplicar */}
            <View className="px-5 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/20">
              <Pressable
                onPress={handleApply}
                disabled={isPending}
                className={`h-12 w-full flex-row items-center justify-center rounded-xl transition-all ${
                  hasChanges
                    ? "bg-primary dark:bg-accent active:opacity-80"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    className={`text-[15px] font-sans-bold ${
                      hasChanges
                        ? "text-white dark:text-primary"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {hasChanges ? "Aplicar Cambios" : "Cerrar"}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Bottom safe area */}
            <View className="h-6" />
          </View>
        </View>
      </Modal>
    );
  },
);
TagPickerModal.displayName = "TagPickerModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
});
