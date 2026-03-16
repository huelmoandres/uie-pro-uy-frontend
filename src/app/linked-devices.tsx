import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import { Smartphone, LogOut, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { PageContainer, ConfirmationModal, Skeleton } from "@components/ui";
import { AuthService } from "@services";
import { getDeviceId } from "@utils/deviceId";
import { APP_TIMEZONE } from "@constants/timezone";
import type { ISession } from "@app-types/auth.types";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
      {children}
    </Text>
  );
}

function SessionSkeleton() {
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-white/5">
      <View className="flex-row items-center flex-1 mr-3">
        <Skeleton width={40} height={40} borderRadius={12} className="mr-3" />
        <View className="flex-1 gap-2">
          <Skeleton width={120} height={14} borderRadius={6} />
          <Skeleton width={100} height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

export default function LinkedDevicesScreen() {
  const queryClient = useQueryClient();
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ISession | null>(null);
  const [revokeOthersModalVisible, setRevokeOthersModalVisible] =
    useState(false);

  useEffect(() => {
    getDeviceId().then(setCurrentDeviceId);
  }, []);

  const {
    data: sessions,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: AuthService.queryKeys.sessions,
    queryFn: () => AuthService.getSessions(),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => AuthService.deleteSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AuthService.queryKeys.sessions });
      setSessionToDelete(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Sesión cerrada",
        text2: "El dispositivo fue deslogueado correctamente.",
      });
    },
    onError: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cerrar la sesión. Intentá nuevamente.",
      });
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      const deviceId = await getDeviceId();
      await AuthService.revokeOtherSessions(deviceId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AuthService.queryKeys.sessions });
      setRevokeOthersModalVisible(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Sesiones cerradas",
        text2: "Se cerró la sesión en todos los demás dispositivos.",
      });
    },
    onError: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cerrar las sesiones. Intentá nuevamente.",
      });
    },
  });

  const otherSessions =
    sessions?.filter((s) => s.deviceId !== currentDeviceId) ?? [];
  const hasOthers = otherSessions.length > 0;

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate(sessionToDelete.id);
    }
  };

  const handleConfirmRevokeOthers = () => {
    revokeOthersMutation.mutate();
  };

  const formatDate = useCallback((dateStr: string) => {
    try {
      return formatInTimeZone(
        new Date(dateStr),
        APP_TIMEZONE,
        "d MMM yyyy, HH:mm",
        { locale: es },
      );
    } catch {
      return dateStr;
    }
  }, []);

  const renderSessionItem = ({ item, index }: { item: ISession; index: number }) => {
    const isCurrent = item.deviceId === currentDeviceId;
    const isLast = index === (sessions?.length ?? 0) - 1;

    return (
      <View
        className={`flex-row items-center justify-between p-4 ${
          !isLast ? "border-b border-slate-50 dark:border-white/5" : ""
        }`}
      >
        <View className="flex-row items-center flex-1 mr-3">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Smartphone size={20} color="#B89146" />
          </View>
          <View className="flex-1">
            <Text className="font-sans-semi text-[15px] text-slate-800 dark:text-slate-200">
              {item.deviceName || "Dispositivo"}
              {isCurrent && (
                <Text className="text-accent font-sans-bold text-xs ml-1">
                  (este)
                </Text>
              )}
            </Text>
            <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
              Última actividad: {formatDate(item.lastUsedAt)}
            </Text>
          </View>
        </View>
        {!isCurrent && (
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(
                Haptics.ImpactFeedbackStyle.Light,
              );
              setSessionToDelete(item);
            }}
            disabled={deleteSessionMutation.isPending}
            className="p-2 rounded-xl active:bg-slate-100 dark:active:bg-white/10"
          >
            <LogOut size={20} color="#EF4444" />
          </Pressable>
        )}
      </View>
    );
  };

  const listHeader = (
    <>
      <View className="mb-6">
        <Text className="text-sm font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
          Acá podés ver en qué dispositivos está iniciada tu sesión y cerrar
          sesión en cualquiera de ellos si no los reconocés o ya no los
          usás.
        </Text>
      </View>
      <SectionTitle>Dispositivos activos</SectionTitle>
    </>
  );

  const listFooter = hasOthers ? (
    <Pressable
      onPress={() => setRevokeOthersModalVisible(true)}
      className="flex-row items-center justify-center bg-danger/10 border border-danger/20 rounded-2xl py-4 active:bg-danger/20 mt-4"
    >
      <Trash2 size={20} color="#EF4444" />
      <Text className="font-sans-bold text-danger text-sm ml-3">
        Cerrar sesión en todos los demás dispositivos
      </Text>
    </Pressable>
  ) : null;

  const listEmpty = (
    <View className="py-8 items-center">
      <Text className="font-sans text-slate-500 dark:text-slate-400">
        No hay sesiones activas.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <PageContainer scrollable>
        <Stack.Screen options={{ title: "Dispositivos vinculados" }} />
        <View className="p-4 pt-6">
          {listHeader}
          <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </View>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isLoading}
          onRefresh={() => refetch()}
          tintColor="#B89146"
        />
      }
    >
      <Stack.Screen options={{ title: "Dispositivos vinculados" }} />

      <View className="p-4 pt-6">
        {listHeader}
        <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-6">
          <FlashList
            data={sessions ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderSessionItem}
            scrollEnabled={false}
            ListEmptyComponent={listEmpty}
          />
        </View>
        {listFooter}
      </View>

      {/* Modal: Cerrar sesión en dispositivo */}
      <ConfirmationModal
        visible={!!sessionToDelete}
        title="¿Cerrar sesión en este dispositivo?"
        description="El dispositivo será deslogueado y tendrá que volver a iniciar sesión para acceder."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSessionToDelete(null)}
      />

      {/* Modal: Cerrar todas las demás */}
      <ConfirmationModal
        visible={revokeOthersModalVisible}
        title="¿Cerrar sesión en todos los demás dispositivos?"
        description="Se cerrará la sesión en todos los dispositivos excepto este. Tendrán que volver a iniciar sesión."
        confirmText="Sí, cerrar todas"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmRevokeOthers}
        onCancel={() => setRevokeOthersModalVisible(false)}
      />
    </PageContainer>
  );
}
