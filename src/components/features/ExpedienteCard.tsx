import React, { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  Hash,
  Star,
  Tag,
  Bell,
  Lock,
  BellDot,
} from "lucide-react-native";
import type { IExpediente } from "@app-types/expediente.types";
import { formatRelativeDate, stripHtml } from "@utils/formatters";
import { TagBadge } from "@components/ui/TagBadge";
import { ContextualTooltip } from "@components/shared/ContextualTooltip";
import { TOOLTIP_KEYS } from "@/constants/onboarding";
import { useTooltipSeen } from "@hooks/useTooltipSeen";

interface Props {
  item: IExpediente;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: (iue: string) => void;
  onPin?: (iue: string, isPinned: boolean) => void;
  /** Si se provee, muestra un botón de etiqueta para abrir el TagPickerModal. */
  onTagsPress?: (iue: string) => void;
  /** Si se provee, muestra un botón para agregar recordatorio al expediente. */
  onAddReminder?: (item: IExpediente) => void;
  /** Mostrar tooltip contextual en el icono de estrella (favorito) */
  showPinTooltip?: boolean;
  /** false = candado en recordatorios y etiquetas (freemium) */
  hasPremiumAccess?: boolean;
  /** true = hay un recordatorio programado para este expediente */
  hasPendingReminder?: boolean;
}

/**
 * Premium Expediente Card
 * Features depth, refined typography, Lucide icons, and tag badges.
 */
export const ExpedienteCard = React.memo(
  ({
    item,
    isSelected,
    isSelectionMode,
    onSelect,
    onPin,
    onTagsPress,
    onAddReminder,
    showPinTooltip = false,
    hasPremiumAccess = true,
    hasPendingReminder = false,
  }: Props) => {
    const { shouldShow: shouldShowPinTooltip, markSeen: markPinTooltipSeen } =
      useTooltipSeen(TOOLTIP_KEYS.EXPEDIENTE_PIN_STAR);
    const handlePress = useCallback(() => {
      if (isSelectionMode) {
        onSelect?.(item.iue);
      } else {
        router.push(`/expedientes/${item.iue.replace("/", ":")}`);
      }
    }, [isSelectionMode, item.iue, onSelect]);

    const handleLongPress = useCallback(() => {
      if (!isSelectionMode) {
        onSelect?.(item.iue);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }, [isSelectionMode, item.iue, onSelect]);

    const handlePin = useCallback(() => {
      markPinTooltipSeen();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPin?.(item.iue, !item.isPinned);
    }, [item.iue, item.isPinned, onPin, markPinTooltipSeen]);

    const handleTagsPress = useCallback(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTagsPress?.(item.iue);
    }, [item.iue, onTagsPress]);

    const handleAddReminder = useCallback(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAddReminder?.(item);
    }, [item, onAddReminder]);

    const hasTags = item.tags && item.tags.length > 0;
    const tagColor = hasTags ? "#B89146" : "#94A3B8";
    const starColor = item.isPinned ? "#B89146" : "#94A3B8";
    const starFill = item.isPinned ? "#B89146" : "transparent";

    return (
      <Pressable
        className={`mb-2.5 overflow-hidden rounded-[24px] bg-white p-4 border shadow-premium dark:bg-slate-900/40 dark:shadow-premium-dark active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-900/60 ${
          isSelected
            ? "border-accent bg-accent/5 dark:bg-accent/10"
            : "border-slate-100 dark:border-white/5"
        }`}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {/* Header */}
        <View className="mb-3 gap-2">
          {/* Fila 1: IUE (izq) | Selector o hora (der) */}
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-primary/30 border border-slate-200/50 dark:border-primary/20 shrink-0">
              <Hash size={11} color="#64748B" className="mr-2" />
              <Text className="text-[10px] font-sans-bold uppercase tracking-[0.5px] text-slate-600 dark:text-navy-200">
                {item.iue}
              </Text>
            </View>
            {isSelectionMode ? (
              <View
                className={`h-6 w-6 rounded-full border items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-accent border-accent"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {isSelected && (
                  <View className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </View>
            ) : (
              <View className="flex-row items-center gap-2 shrink-0">
                <Clock size={12} color="#94A3B8" />
                <Text className="text-[11px] font-sans-semi text-slate-400 uppercase tracking-tight">
                  {formatRelativeDate(item.lastSyncAt)}
                </Text>
              </View>
            )}
          </View>
          {/* Fila 2: íconos de acción a la derecha */}
          {!isSelectionMode && (onAddReminder || onTagsPress || onPin) && (
            <View className="flex-row items-center justify-end gap-1">
              {onAddReminder && (
                <Pressable
                  onPress={handleAddReminder}
                  hitSlop={10}
                  className="p-1 flex-row items-center gap-0.5"
                >
                  <Bell size={15} color="#B89146" />
                  {!hasPremiumAccess && <Lock size={12} color="#94A3B8" />}
                </Pressable>
              )}
              {onTagsPress && (
                <Pressable
                  onPress={handleTagsPress}
                  hitSlop={10}
                  className="p-1 flex-row items-center gap-0.5"
                >
                  <Tag size={15} color={tagColor} />
                  {!hasPremiumAccess && <Lock size={12} color="#94A3B8" />}
                </Pressable>
              )}
              {onPin &&
                (showPinTooltip && shouldShowPinTooltip ? (
                  <ContextualTooltip
                    message="Fijá este expediente para tenerlo siempre a mano"
                    visible={showPinTooltip && shouldShowPinTooltip}
                    onDismiss={markPinTooltipSeen}
                    placement="bottom"
                  >
                    <Pressable onPress={handlePin} hitSlop={10} className="p-1">
                      <Star size={15} color={starColor} fill={starFill} />
                    </Pressable>
                  </ContextualTooltip>
                ) : (
                  <Pressable onPress={handlePin} hitSlop={10} className="p-1">
                    <Star size={15} color={starColor} fill={starFill} />
                  </Pressable>
                ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View className="flex-row gap-3">
          <View className="flex-1 min-w-0">
            <Text
              className="mb-2 text-[15px] font-sans-bold leading-snug text-slate-900 dark:text-white"
              numberOfLines={2}
            >
              {stripHtml(item.caratula) || "Sin carátula registrada"}
            </Text>

            <View className="flex-row items-center gap-2.5 mt-0.5">
              <View className="h-2 w-2 rounded-full bg-accent shrink-0" />
              <Text
                className="flex-1 text-[12px] font-sans-medium text-slate-500 dark:text-slate-400"
                numberOfLines={1}
              >
                {item.sede}
              </Text>
            </View>
          </View>
          <View className="items-center justify-center shrink-0">
            <ChevronRight size={18} color="#94A3B8" />
          </View>
        </View>

        {/* Tags row — solo si hay tags asignados */}
        {hasTags && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerClassName="flex-row gap-2"
          >
            {item.tags!.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="xs" />
            ))}
          </ScrollView>
        )}

        {/* Separator */}
        <View className="my-3 h-[1px] w-full bg-slate-100 dark:bg-white/5" />

        {/* Footer stats */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <FileText size={12} color="#B89146" />
            </View>
            <Text className="text-[12px] font-sans-semi text-slate-600 dark:text-slate-400">
              {item.totalMovimientos}{" "}
              <Text className="text-slate-400 font-sans">eventos</Text>
            </Text>
          </View>

          <View className="flex-row items-center gap-2 shrink-0">
            {hasPendingReminder && (
              <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 px-2.5 py-1.5">
                <BellDot size={11} color="#D97706" />
                <Text className="text-[10px] font-sans-semi text-amber-600 dark:text-amber-400">
                  Recordatorio
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/30">
              <Calendar size={12} color="#94A3B8" />
              <Text className="text-[11px] font-sans-bold text-slate-500 dark:text-slate-400">
                {item.anio}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
);
ExpedienteCard.displayName = "ExpedienteCard";
