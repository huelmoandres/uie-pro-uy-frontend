import React, { useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Linking,
  AppState,
} from "react-native";
import { Stack } from "expo-router";
import { Bell, BellOff, Mail } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { PageContainer } from "@components/ui";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@hooks/useNotificationPreferences";
import { useQueryClient } from "@tanstack/react-query";
import {
  requestAndRegisterNotifications,
  clearCachedPushToken,
} from "@hooks/useNotifications";
import type {
  INotificationPreferences,
  PushNotificationMode,
} from "@app-types/notification-preferences.types";
import { InfoBanner } from "@components/shared/InfoBanner";
import {
  NOTIFICATION_TYPES,
  DIGEST_DAYS,
  PUSH_MODE_OPTIONS,
} from "@constants/notifications.constants";
import Toast from "react-native-toast-message";

/** Título de sección reutilizable */
function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
      {children}
    </Text>
  );
}

/** Card contenedor para secciones */
function SectionCard({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View
      className={`overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-6 ${disabled ? "opacity-40" : ""}`}
    >
      {children}
    </View>
  );
}

export default function NotificationsScreen() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs } = useUpdateNotificationPreferences();
  const queryClient = useQueryClient();

  // Al entrar a la pantalla con push activado y sin token, intentar registrar (por si se perdió)
  useEffect(() => {
    if (prefs?.pushEnabled && !prefs?.hasDeviceToken) {
      void requestAndRegisterNotifications().then((result) => {
        if (result.ok) {
          void queryClient.invalidateQueries({
            queryKey: ["notification-preferences"],
          });
        }
      });
    }
  }, [prefs?.pushEnabled, prefs?.hasDeviceToken, queryClient]);

  // Al volver de Configuración del dispositivo: re-intentar registro (el usuario pudo haber habilitado permisos)
  useEffect(() => {
    if (!prefs?.pushEnabled || prefs?.hasDeviceToken) return;
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void requestAndRegisterNotifications().then((result) => {
          if (result.ok) {
            void queryClient.invalidateQueries({
              queryKey: ["notification-preferences"],
            });
          }
        });
      }
    });
    return () => sub.remove();
  }, [prefs?.pushEnabled, prefs?.hasDeviceToken, queryClient]);

  const handleToggle = (
    key: keyof INotificationPreferences,
    value: boolean,
  ) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePrefs({ [key]: value });
    // Al activar push, registrar el token en device_tokens (por si se perdió)
    if (key === "pushEnabled" && value) {
      void requestAndRegisterNotifications().then((result) => {
        if (result.ok) {
          void queryClient.invalidateQueries({
            queryKey: ["notification-preferences"],
          });
        }
      });
    }
  };

  const handleDigestDayChange = (day: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePrefs({ digestDay: day });
  };

  const handleModeChange = (mode: PushNotificationMode) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePrefs({ pushNotificationMode: mode });
  };

  const masterEnabled = prefs?.pushEnabled ?? true;

  return (
    <PageContainer scrollable>
      <Stack.Screen options={{ title: "Notificaciones" }} />

      <View className="p-4 pt-6">
        <View className="mb-6">
          <InfoBanner
            icon={Bell}
            iconSize={90}
            title="Alertas en tiempo real"
            description="Configurá qué notificaciones push querés recibir en tu dispositivo cuando haya novedades en tus expedientes."
          />
        </View>

        <SectionTitle>General</SectionTitle>
        <SectionCard>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                {masterEnabled ? (
                  <Bell size={18} color="#B89146" />
                ) : (
                  <BellOff size={18} color="#94A3B8" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-sans-semi text-[15px] text-slate-800 dark:text-slate-200">
                  Activar notificaciones
                </Text>
                <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                  Interruptor maestro de todas las alertas push
                </Text>
              </View>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#B89146" />
            ) : (
              <Switch
                value={masterEnabled}
                onValueChange={(v) => handleToggle("pushEnabled", v)}
                trackColor={{ false: "#E2E8F0", true: "#B89146" }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
        </SectionCard>

        <SectionTitle>Tipos de Alerta</SectionTitle>
        <SectionCard disabled={!masterEnabled}>
          {NOTIFICATION_TYPES.map((item, index) => {
            const Icon = item.icon;
            const isEnabled = prefs?.[item.key] ?? true;
            const isLast = index === NOTIFICATION_TYPES.length - 1;

            return (
              <View
                key={item.key}
                className={`flex-row items-center justify-between p-4 ${!isLast ? "border-b border-slate-50 dark:border-white/5" : ""}`}
              >
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                    <Icon
                      size={17}
                      color={isEnabled && masterEnabled ? "#64748B" : "#94A3B8"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semi text-[14px] text-slate-700 dark:text-slate-300">
                      {item.title}
                    </Text>
                    <Text className="text-[11px] font-sans text-slate-400 mt-0.5 leading-tight">
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={(v) => handleToggle(item.key, v)}
                  disabled={!masterEnabled || isLoading}
                  trackColor={{ false: "#E2E8F0", true: "#B89146" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            );
          })}
        </SectionCard>

        <SectionTitle>Modo de alertas</SectionTitle>
        <SectionCard disabled={!masterEnabled}>
          <View className="p-4 gap-3">
            <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Elegí cómo recibís las notificaciones cuando hay novedades en varios expedientes al mismo tiempo.
            </Text>
            {PUSH_MODE_OPTIONS.map((option, index) => {
              const currentMode =
                prefs?.pushNotificationMode ?? "INDIVIDUAL";
              const isSelected = currentMode === option.value;
              const isLast = index === PUSH_MODE_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleModeChange(option.value)}
                  disabled={!masterEnabled || isLoading}
                  className={`flex-row items-start gap-3 p-3 rounded-xl border ${
                    isSelected
                      ? "bg-accent/10 border-accent/30"
                      : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10"
                  } ${!isLast ? "mb-1" : ""}`}
                >
                  <View
                    className={`mt-0.5 h-5 w-5 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-slate-300 dark:border-slate-600 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-sans-semi text-[14px] ${
                        isSelected
                          ? "text-amber-800 dark:text-amber-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-[11px] font-sans text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionTitle>Resumen por email</SectionTitle>
        <SectionCard>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <Mail size={18} color="#B89146" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semi text-[15px] text-slate-800 dark:text-slate-200">
                  Resumen semanal por email
                </Text>
                <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                  Plazos, actividad reciente e expedientes inactivos cada semana
                </Text>
              </View>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#B89146" />
            ) : (
              <Switch
                value={prefs?.emailWeeklyDigest ?? false}
                onValueChange={(v) => handleToggle("emailWeeklyDigest", v)}
                trackColor={{ false: "#E2E8F0", true: "#B89146" }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
          {(prefs?.emailWeeklyDigest ?? false) && (
            <View className="px-4 pb-4 pt-0 border-t border-slate-50 dark:border-white/5">
              <Text className="mt-4 mb-2 text-[11px] font-sans-semi text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Día de envío
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {DIGEST_DAYS.map((d) => {
                  const isSelected = (prefs?.digestDay ?? 1) === d.value;
                  return (
                    <Pressable
                      key={d.value}
                      onPress={() => handleDigestDayChange(d.value)}
                      className={`rounded-lg px-4 py-2.5 ${
                        isSelected
                          ? "bg-accent"
                          : "bg-slate-100 dark:bg-white/5"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-sans-semi ${
                          isSelected
                            ? "text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </SectionCard>

        <Text className="mt-4 mx-2 text-[11px] font-sans text-slate-400 leading-relaxed text-center">
          Las notificaciones push requieren que hayas otorgado permiso al
          sistema operativo. Si no las recibís, verificá la configuración de tu
          dispositivo.
        </Text>

        {masterEnabled && prefs?.hasDeviceToken && (
          <View className="mt-6 mx-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex-row items-center justify-center gap-2">
            <Text className="text-[13px] font-sans-semi text-green-700 dark:text-green-400">
              Dispositivo registrado correctamente
            </Text>
          </View>
        )}

        {masterEnabled && !prefs?.hasDeviceToken && (
          <View className="mt-6 mx-4 gap-3">
            <Pressable
              onPress={async () => {
                // Clear the cache so requestAndRegisterNotifications always
                // calls the API, even if the token hasn't changed locally.
                await clearCachedPushToken();
                const result = await requestAndRegisterNotifications();
                if (result.ok) {
                  await queryClient.invalidateQueries({
                    queryKey: ["notification-preferences"],
                  });
                  Toast.show({
                    type: "success",
                    text1: "Token registrado",
                    text2: "Las notificaciones deberían funcionar correctamente.",
                  });
                } else {
                  Toast.show({
                    type: "error",
                    text1: "No se pudo registrar",
                    text2: result.reason,
                  });
                }
              }}
              className="py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
            >
              <Text className="text-center text-[13px] font-sans-semi text-slate-600 dark:text-slate-400">
                Registrar dispositivo de nuevo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void Linking.openSettings()}
              className="py-2.5"
            >
              <Text className="text-center text-[12px] font-sans-semi text-accent">
                Abrir configuración del dispositivo
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
