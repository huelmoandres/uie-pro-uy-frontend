import React, { useState, useCallback } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { X, Tag, Plus, Pencil, Trash2, Check } from "lucide-react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTags } from "@hooks/useTags";
import { useTagMutations } from "@hooks/useTagMutations";
import { TagBadge } from "@components/ui/TagBadge";
import { ConfirmationModal } from "@components/ui";
import { useModalKeyboardDismiss } from "@hooks/useModalKeyboardDismiss";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import type { ITag } from "@app-types/tag.types";

// Paleta de colores predefinidos para el picker de color
const COLOR_PALETTE = [
  "#ef4444", // Rojo
  "#f97316", // Naranja
  "#f59e0b", // Ámbar
  "#eab308", // Amarillo
  "#84cc16", // Lima
  "#22c55e", // Verde
  "#10b981", // Esmeralda
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Azul
  "#6366f1", // Índigo
  "#8b5cf6", // Violeta
  "#a855f7", // Púrpura
  "#d946ef", // Fucsia
  "#ec4899", // Rosa
  "#f43f5e", // Rosado intenso
  "#64748b", // Slate
  "#6b7280", // Gris
  "#b89146", // Dorado (accent)
  "#0f172a", // Navy
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal de gestión completa de etiquetas: crear, editar nombre/color, eliminar.
 * Accesible desde la pantalla de configuración o ajustes del usuario.
 */
export const ManageTagsModal = React.memo(({ visible, onClose }: Props) => {
  const { data: tags = [], isLoading } = useTags();
  const { createTag, updateTag, deleteTag } = useTagMutations();

  // Estado del mini-formulario en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  // Estado para modal de confirmación de eliminación
  const [tagToDelete, setTagToDelete] = useState<ITag | null>(null);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setIsCreating(false);
    setName("");
    setSelectedColor(COLOR_PALETTE[0]);
  }, []);

  const handleStartEdit = useCallback((tag: ITag) => {
    setIsCreating(false);
    setEditingId(tag.id);
    setName(tag.name);
    setSelectedColor(tag.color);
  }, []);

  const handleStartCreate = useCallback(() => {
    resetForm();
    setIsCreating(true);
  }, [resetForm]);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isCreating) {
      createTag.mutate(
        { name: trimmed, color: selectedColor },
        { onSettled: resetForm },
      );
    } else if (editingId) {
      updateTag.mutate(
        { tagId: editingId, payload: { name: trimmed, color: selectedColor } },
        { onSettled: resetForm },
      );
    }
  }, [
    name,
    isCreating,
    editingId,
    selectedColor,
    createTag,
    updateTag,
    resetForm,
  ]);

  const handleConfirmDelete = useCallback(() => {
    if (!tagToDelete) return;
    deleteTag.mutate(tagToDelete.id);
    setTagToDelete(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [tagToDelete, deleteTag]);

  const isSaving = createTag.isPending || updateTag.isPending;

  useModalKeyboardDismiss(visible, resetForm);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable className="flex-1" onPress={onClose} />

          <KeyboardAvoidingView
            {...KEYBOARD_AVOIDING_VIEW_PROPS}
            style={{ width: "100%" }}
          >
            <Animated.View
              entering={SlideInDown.duration(280).springify()}
              className="bg-white dark:bg-surface-dark rounded-t-[28px] overflow-hidden"
            >
              {/* Handle */}
              <View className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 self-center mt-3" />

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
                <View className="flex-row items-center gap-2">
                  <Tag size={16} color="#B89146" />
                  <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white">
                    Mis etiquetas
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

              <ScrollView
                className="max-h-80"
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  gap: 8,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Lista de tags existentes */}
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#B89146"
                    className="py-6"
                  />
                ) : (
                  tags.map((tag) => {
                    if (editingId === tag.id) {
                      return (
                        <InlineTagForm
                          key={tag.id}
                          name={name}
                          selectedColor={selectedColor}
                          onChangeName={setName}
                          onChangeColor={setSelectedColor}
                          onSave={handleSave}
                          onCancel={resetForm}
                          isSaving={isSaving}
                        />
                      );
                    }
                    return (
                      <View
                        key={tag.id}
                        className="flex-row items-center justify-between px-3 py-2 rounded-xl border border-slate-100 dark:border-white/5"
                      >
                        <TagBadge tag={tag} size="sm" />
                        <View className="flex-row items-center gap-3">
                          <Pressable
                            onPress={() => handleStartEdit(tag)}
                            hitSlop={8}
                            className="active:opacity-60"
                          >
                            <Pencil size={14} color="#94A3B8" />
                          </Pressable>
                          <Pressable
                            onPress={() => setTagToDelete(tag)}
                            hitSlop={8}
                            className="active:opacity-60"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}

                {/* Formulario de creación */}
                {isCreating && (
                  <InlineTagForm
                    name={name}
                    selectedColor={selectedColor}
                    onChangeName={setName}
                    onChangeColor={setSelectedColor}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isSaving={isSaving}
                  />
                )}

                {/* Botón de nueva etiqueta */}
                {!isCreating && !editingId && tags.length < 20 && (
                  <Pressable
                    onPress={handleStartCreate}
                    className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 active:opacity-60"
                  >
                    <Plus size={14} color="#B89146" />
                    <Text className="text-[13px] font-sans-semi text-accent">
                      Nueva etiqueta
                    </Text>
                  </Pressable>
                )}

                {tags.length >= 20 && (
                  <Text className="text-[11px] font-sans text-slate-400 text-center mt-1">
                    Límite de 20 etiquetas alcanzado.
                  </Text>
                )}
              </ScrollView>

              {/* Bottom safe area */}
              <View className="h-6" />
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        visible={!!tagToDelete}
        title="Eliminar etiqueta"
        description={`¿Eliminás "${tagToDelete?.name}"? Se desasignará de todos tus expedientes.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTagToDelete(null)}
      />
    </>
  );
});
ManageTagsModal.displayName = "ManageTagsModal";

// ─── InlineTagForm ────────────────────────────────────────────────────────────

interface InlineTagFormProps {
  name: string;
  selectedColor: string;
  onChangeName: (v: string) => void;
  onChangeColor: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const InlineTagForm = ({
  name,
  selectedColor,
  onChangeName,
  onChangeColor,
  onSave,
  onCancel,
  isSaving,
}: InlineTagFormProps) => (
  <View className="gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
    {/* Input de nombre */}
    <TextInput
      value={name}
      onChangeText={onChangeName}
      placeholder="Nombre de la etiqueta..."
      placeholderTextColor="#94A3B8"
      maxLength={40}
      className="text-[13px] font-sans text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-surface-dark"
    />

    {/* Picker de color */}
    <View className="flex-row flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => (
        <Pressable
          key={color}
          onPress={() => onChangeColor(color)}
          className="w-6 h-6 rounded-full items-center justify-center active:scale-90"
          style={{ backgroundColor: color }}
        >
          {selectedColor === color && <Check size={12} color="white" />}
        </Pressable>
      ))}
    </View>

    {/* Botones */}
    <View className="flex-row gap-2 justify-end">
      <Pressable
        onPress={onCancel}
        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 active:opacity-60"
      >
        <Text className="text-[12px] font-sans-semi text-slate-500">
          Cancelar
        </Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={!name.trim() || isSaving}
        className="px-3 py-1.5 rounded-lg bg-accent active:opacity-70 disabled:opacity-40"
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-[12px] font-sans-semi text-white">Guardar</Text>
        )}
      </Pressable>
    </View>
  </View>
);
InlineTagForm.displayName = "InlineTagForm";
