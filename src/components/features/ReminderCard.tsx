import React from "react";
import { Pressable, Text, View } from "react-native";
import { Bell, Trash2 } from "lucide-react-native";
import {
  formatReminderDateTime,
  getReminderStatusLabel,
} from "@utils/formatters";
import type { IReminder } from "@app-types/reminder.types";

interface Props {
  reminder: IReminder;
  onDelete?: (id: string) => void;
}

export const ReminderCard = React.memo(({ reminder, onDelete }: Props) => {
  const isScheduled = reminder.status === "SCHEDULED";

  return (
    <View className="mb-2.5 rounded-[18px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent/10 shrink-0">
            <Bell size={14} color="#B89146" />
          </View>
          <View className="flex-1">
            <Text
              className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300"
              numberOfLines={1}
            >
              {reminder.title ?? "Recordatorio"}
            </Text>
            <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5">
              {formatReminderDateTime(reminder.remindAt)}
            </Text>
            <View className="mt-2 rounded-lg bg-slate-50 dark:bg-white/5 px-2 py-1 self-start">
              <Text className="text-[10px] font-sans-semi text-slate-500 dark:text-slate-400">
                {getReminderStatusLabel(reminder.status)}
              </Text>
            </View>
          </View>
        </View>
        {isScheduled && onDelete && (
          <Pressable
            onPress={() => onDelete(reminder.id)}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 active:opacity-70"
          >
            <Trash2 size={14} color="#EF4444" />
          </Pressable>
        )}
      </View>
    </View>
  );
});
