import React from "react";
import { View, Text } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react-native";

/**
 * Toast config — claro en light mode, oscuro en dark mode.
 * Light: fondo blanco, texto slate, borde sutil.
 * Dark:  fondo primary (#0B1120), texto blanco.
 */
export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="mx-4 w-[92%] flex-row items-center rounded-2xl border border-success/20 bg-white dark:bg-primary p-4 shadow-premium dark:shadow-premium-dark">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-success/10">
        <CheckCircle2 size={20} color="#10B981" />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-sans-bold text-slate-900 dark:text-white tracking-tight">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="mx-4 w-[92%] flex-row items-center rounded-2xl border border-danger/20 bg-white dark:bg-primary p-4 shadow-premium dark:shadow-premium-dark">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-danger/10">
        <AlertCircle size={20} color="#EF4444" />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-sans-bold text-slate-900 dark:text-white tracking-tight">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View className="mx-4 w-[92%] flex-row items-center rounded-2xl border border-accent/20 bg-white dark:bg-primary p-4 shadow-premium dark:shadow-premium-dark">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
        <Info size={20} color="#B89146" />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-sans-bold text-slate-900 dark:text-white tracking-tight">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  warning: ({ text1, text2 }) => (
    <View className="mx-4 w-[92%] flex-row items-center rounded-2xl border border-warning/20 bg-white dark:bg-primary p-4 shadow-premium dark:shadow-premium-dark">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
        <AlertTriangle size={20} color="#F59E0B" />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-sans-bold text-slate-900 dark:text-white tracking-tight">
          {text1}
        </Text>
        {text2 && (
          <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
};
