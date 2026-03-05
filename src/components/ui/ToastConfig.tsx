import React from 'react';
import { View, Text, Platform } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';

/**
 * Premium Toast Configuration.
 * Uses the Judicial Connector Navy & Gold palette.
 * Features glassmorphism effects and refined typography.
 */
export const toastConfig: ToastConfig = {
    success: ({ text1, text2 }) => (
        <View className="mx-6 w-[90%] flex-row items-center rounded-2xl border border-success/30 bg-primary p-4 shadow-premium-dark dark:bg-slate-900/90 dark:backdrop-blur-xl">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 size={22} color="#10B981" />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-sans-bold text-white tracking-tight">{text1}</Text>
                {text2 && <Text className="text-[11px] font-sans text-slate-400 mt-1 leading-tight">{text2}</Text>}
            </View>
        </View>
    ),
    error: ({ text1, text2 }) => (
        <View className="mx-6 w-[90%] flex-row items-center rounded-2xl border border-danger/30 bg-primary p-4 shadow-premium-dark dark:bg-slate-900/90 dark:backdrop-blur-xl">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                <AlertCircle size={22} color="#EF4444" />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-sans-bold text-white tracking-tight">{text1}</Text>
                {text2 && <Text className="text-[11px] font-sans text-slate-400 mt-1 leading-tight">{text2}</Text>}
            </View>
        </View>
    ),
    info: ({ text1, text2 }) => (
        <View className="mx-6 w-[90%] flex-row items-center rounded-2xl border border-accent/30 bg-primary p-4 shadow-premium-dark dark:bg-slate-900/90 dark:backdrop-blur-xl">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Info size={22} color="#B89146" />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-sans-bold text-white tracking-tight">{text1}</Text>
                {text2 && <Text className="text-[11px] font-sans text-slate-400 mt-1 leading-tight">{text2}</Text>}
            </View>
        </View>
    ),
    warning: ({ text1, text2 }) => (
        <View className="mx-6 w-[90%] flex-row items-center rounded-2xl border border-warning/30 bg-primary p-4 shadow-premium-dark dark:bg-slate-900/90 dark:backdrop-blur-xl">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <AlertTriangle size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-sans-bold text-white tracking-tight">{text1}</Text>
                {text2 && <Text className="text-[11px] font-sans text-slate-400 mt-1 leading-tight">{text2}</Text>}
            </View>
        </View>
    ),
};
