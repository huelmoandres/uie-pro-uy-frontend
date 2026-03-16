import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import { Bell, X, CalendarClock, ChevronLeft } from "lucide-react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useCreateReminder } from "@hooks/useReminderMutations";
import {
  REMINDER_OFFSET_OPTIONS,
  REMINDER_FIXED_DATE_PRESETS,
  DEFAULT_REMINDER_OFFSET,
  DEFAULT_REMINDER_HOUR,
} from "@constants/reminders";
import { modalBottomSheetStyles } from "@utils/modalStyles";
import {
  buildCreateReminderPayload,
  buildCreateFixedReminderPayload,
  getDefaultReminderDate,
  getReminderDateForPreset,
} from "@utils/reminders.utils";
import { stripHtml } from "@utils/formatters";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { APP_TIMEZONE } from "@constants/timezone";
import { useColorScheme } from "@/components/base/useColorScheme";
import { useModalKeyboardDismiss } from "@hooks/useModalKeyboardDismiss";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";

type ViewMode = "simple" | "full";

interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  /** Desde agenda/plazos: provee el plazo (muestra vista simple con offset) */
  agendaItem?: IAgendaItem | null;
  /** Desde expediente: IUE + caratula (muestra vista full directamente) */
  iue?: string | null;
  caratula?: string | null;
}

/**
 * Modal unificado para crear recordatorios.
 * - Con agendaItem (plazos): vista simple (offset) + opción "Personalizar fecha y hora".
 * - Con iue (expediente): vista full (fecha/hora, título, descripción) directamente.
 */
export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  visible,
  onClose,
  agendaItem,
  iue: iueProp,
  caratula: caratulaProp,
}) => {
  const colorScheme = useColorScheme();
  const themeVariant = colorScheme === "dark" ? "dark" : "light";
  const createReminder = useCreateReminder();
  const scrollRef = useRef<ScrollView>(null);

  const scrollToInput = useCallback((y: number) => {
    setTimeout(
      () => scrollRef.current?.scrollTo({ y, animated: true }),
      100,
    );
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  }, []);

  const iue = agendaItem?.iue ?? iueProp ?? null;
  const caratula = agendaItem?.caratula ?? caratulaProp ?? null;
  const isPlazoContext = agendaItem != null && agendaItem.status === "OPEN";

  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [selectedOffset, setSelectedOffset] = useState(DEFAULT_REMINDER_OFFSET);
  const [remindAt, setRemindAt] = useState<Date>(() => getDefaultReminderDate());
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (visible) {
      setViewMode(isPlazoContext ? "simple" : "full");
      setSelectedOffset(DEFAULT_REMINDER_OFFSET);
      setRemindAt(getDefaultReminderDate());
      setSelectedPreset(null);
      setTitle("");
      setBody("");
      setShowPicker(false);
    }
  }, [visible, isPlazoContext]);

  useModalKeyboardDismiss(visible);

  const openAndroidDateTimePicker = () => {
    const minDate = new Date();
    const openDatePicker = () => {
      DateTimePickerAndroid.open({
        value: remindAt,
        mode: "date",
        minimumDate: minDate,
        timeZoneName: APP_TIMEZONE,
        onChange: (evt, date) => {
          if (evt.type === "set" && date) {
            const newDate = new Date(date);
            newDate.setHours(remindAt.getHours(), remindAt.getMinutes(), 0, 0);
            openTimePicker(newDate);
          }
        },
      });
    };
    const openTimePicker = (date: Date) => {
      DateTimePickerAndroid.open({
        value: date,
        mode: "time",
        is24Hour: true,
        timeZoneName: APP_TIMEZONE,
        onChange: (evt, time) => {
          if (evt.type === "set" && time) {
            const final = new Date(date);
            final.setHours(time.getHours(), time.getMinutes(), 0, 0);
            handlePickerChange(final);
          }
        },
      });
    };
    openDatePicker();
  };

  const handlePresetPress = (days: number) => {
    setRemindAt(getReminderDateForPreset(days));
    setSelectedPreset(days);
  };

  const handlePickerChange = (date: Date) => {
    setRemindAt(date);
    setSelectedPreset(null);
  };

  const handleCreateSimple = () => {
    if (!agendaItem || agendaItem.status !== "OPEN") return;
    createReminder.mutate(buildCreateReminderPayload(agendaItem, selectedOffset), {
      onSuccess: onClose,
    });
  };

  const handleCreateFull = () => {
    if (!iue) return;
    createReminder.mutate(
      buildCreateFixedReminderPayload(iue, remindAt, title || null, body || null),
      { onSuccess: onClose },
    );
  };

  const formattedDate = formatInTimeZone(
    remindAt,
    APP_TIMEZONE,
    "EEEE d 'de' MMMM, HH:mm",
    { locale: es },
  );

  if (!visible) return null;

  const displayCaratula = caratula ? stripHtml(caratula) : null;

  const Content = viewMode === "simple" ? (
    <View className="px-6 py-5">
      {iue && (
        <>
          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2">
            Expediente
          </Text>
          <Text className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300 mb-4">
            {iue}
          </Text>

          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-3">
            Recordarme
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {REMINDER_OFFSET_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedOffset(opt.value)}
                className={`px-4 py-2.5 rounded-xl border ${
                  selectedOffset === opt.value
                    ? "bg-accent border-accent"
                    : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[13px] font-sans-semi ${
                    selectedOffset === opt.value
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mb-4">
            Recibirás una notificación push el día indicado a las{" "}
            {String(DEFAULT_REMINDER_HOUR).padStart(2, "0")}:00.
          </Text>

          <Pressable
            onPress={() => setViewMode("full")}
            className="mb-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 active:opacity-70"
          >
            <Text className="text-center text-[13px] font-sans-semi text-slate-600 dark:text-slate-400">
              Personalizar fecha y hora
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreateSimple}
            disabled={createReminder.isPending}
            className="w-full py-3.5 rounded-xl bg-accent items-center justify-center active:opacity-80 disabled:opacity-50"
          >
            {createReminder.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-[14px] font-sans-bold text-white">
                Crear recordatorio
              </Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  ) : (
    <ScrollView
      ref={scrollRef}
      className="flex-1 px-6"
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 16, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {iue && (
        <>
          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2">
            Expediente
          </Text>
          <Text className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300 mb-1">
            {iue}
          </Text>
          {displayCaratula && (
            <Text
              className="text-[12px] font-sans text-slate-500 dark:text-slate-400 mb-4"
              numberOfLines={2}
            >
              {displayCaratula}
            </Text>
          )}
          {!displayCaratula && <View className="mb-4" />}

          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2">
            Recordarme
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {REMINDER_FIXED_DATE_PRESETS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handlePresetPress(opt.value)}
                className={`px-4 py-2.5 rounded-xl border ${
                  selectedPreset === opt.value
                    ? "bg-accent border-accent"
                    : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[13px] font-sans-semi ${
                    selectedPreset === opt.value
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2 mt-2">
            Fecha y hora
          </Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === "android") {
                openAndroidDateTimePicker();
              } else {
                setShowPicker(true);
                setTimeout(
                  () => scrollRef.current?.scrollTo?.({ y: 260, animated: true }),
                  100,
                );
              }
            }}
            className="flex-row items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 mb-4"
          >
            <CalendarClock size={18} color="#B89146" />
            <Text className="flex-1 font-sans-semi text-[14px] text-slate-700 dark:text-slate-200 capitalize">
              {formattedDate}
            </Text>
          </Pressable>

          {showPicker && Platform.OS === "ios" && (
            <View className="mt-2 mb-2" style={{ height: 270 }}>
              <DateTimePicker
                value={remindAt}
                mode="datetime"
                display="spinner"
                themeVariant={themeVariant}
                onChange={(_, date) => {
                  if (date) handlePickerChange(date);
                }}
                minimumDate={new Date()}
                locale="es"
                timeZoneName={APP_TIMEZONE}
                style={{ height: 300 }}
              />
              <Pressable
                onPress={() => setShowPicker(false)}
                className="mt-2 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10"
              >
                <Text className="text-center font-sans-semi text-slate-600 dark:text-slate-300">
                  Listo
                </Text>
              </Pressable>
            </View>
          )}

          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2">
            Título (opcional)
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onFocus={() => scrollToInput(300)}
            placeholder={`Ej: Recordatorio: ${iue}`}
            placeholderTextColor="#94A3B8"
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 font-sans text-[14px] text-slate-700 dark:text-slate-200 mb-4"
          />

          <Text className="text-[12px] font-sans-bold uppercase tracking-wider text-slate-400 mb-2">
            Descripción (opcional)
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            onFocus={scrollToEnd}
            placeholder="Ej: Revisar documentación antes de la audiencia"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 font-sans text-[14px] text-slate-700 dark:text-slate-200 mb-6 min-h-[80px]"
            style={{ textAlignVertical: "top" }}
          />

          <Pressable
            onPress={handleCreateFull}
            disabled={createReminder.isPending}
            className="w-full py-3.5 rounded-xl bg-accent items-center justify-center active:opacity-80 disabled:opacity-50"
          >
            {createReminder.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-[14px] font-sans-bold text-white">
                Crear recordatorio
              </Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={modalBottomSheetStyles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={modalBottomSheetStyles.backdrop} />
        </Pressable>

        <KeyboardAvoidingView
          {...KEYBOARD_AVOIDING_VIEW_PROPS}
          style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
        >
          <View
            className={`w-full rounded-t-[32px] bg-white dark:bg-[#0B1120] border border-b-0 border-slate-100 dark:border-white/5 overflow-hidden ${
              viewMode === "full" ? "flex-1 max-h-[90%] pb-4" : "pb-10"
            }`}
          >
          <View className="items-center pt-4 pb-2">
            <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
          </View>

          <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
            <View className="flex-row items-center gap-3">
              {viewMode === "full" && isPlazoContext && (
                <Pressable
                  onPress={() => setViewMode("simple")}
                  className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
                >
                  <ChevronLeft size={18} color="#64748B" />
                </Pressable>
              )}
              <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-accent/10">
                <Bell size={18} color="#B89146" />
              </View>
              <Text className="text-lg font-sans-bold text-slate-900 dark:text-white">
                Agregar recordatorio
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
            >
              <X size={15} color="#94A3B8" />
            </Pressable>
          </View>

          {viewMode === "full" ? (
            <View className="flex-1 min-h-0">{Content}</View>
          ) : (
            Content
          )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
