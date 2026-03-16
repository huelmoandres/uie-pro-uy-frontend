import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { GitCompare } from "lucide-react-native";
import { useExpedienteCompare, useDeadlineAgenda } from "@hooks";
import { CompareExpedientePanel } from "@components/features";
import { PageContainer } from "@components/ui";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";

const MAX_IUES = 3;
const MIN_IUES = 2;

function filterPlazosByIues(
  agendaItems: IAgendaItem[] | undefined,
  iue: string,
): IAgendaItem[] {
  if (!agendaItems) return [];
  return agendaItems.filter(
    (item) => item.iue === iue && item.status === "OPEN",
  );
}

export default function CompareExpedientesScreen() {
  const { iues: iuesParam } = useLocalSearchParams<{ iues?: string }>();
  const { width } = useWindowDimensions();

  const iues = useMemo(() => {
    const raw = iuesParam ?? "";
    return raw
      .split(",")
      .map((s) => s.trim().replace(":", "/"))
      .filter(Boolean)
      .slice(0, MAX_IUES);
  }, [iuesParam]);

  const { expedientes, isLoading, isError } = useExpedienteCompare(iues);
  const { data: agendaItems } = useDeadlineAgenda();

  const isValidSelection = iues.length >= MIN_IUES && iues.length <= MAX_IUES;
  // En landscape (width ~667) usar vista lado a lado; tablet 768+
  const isSideBySide = width >= 500;

  const handleBack = () => router.back();

  // Rotar a landscape al comparar; restaurar a portrait al salir.
  // Opcional: expo-screen-orientation requiere dev build; en Expo Go no está disponible.
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "web" || !isValidSelection) return;

      let cleanup: (() => void) | undefined;
      import("expo-screen-orientation")
        .then((ScreenOrientation) => {
          void ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE,
          );
          cleanup = () => {
            void ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT_UP,
            );
          };
        })
        .catch(() => {
          // Módulo no disponible (Expo Go, etc.) — no bloquear orientación
        });

      return () => {
        if (cleanup) cleanup();
      };
    }, [isValidSelection]),
  );

  if (!isValidSelection) {
    return (
      <>
        <PageContainer scrollable withHeader>
          <View className="flex-1 items-center justify-center py-20">
            <GitCompare size={48} color="#94A3B8" />
            <Text className="mt-4 text-center font-sans-bold text-slate-900 dark:text-white">
              Seleccioná 2 o 3 expedientes
            </Text>
            <Text className="mt-2 px-8 text-center text-[13px] font-sans text-slate-500 dark:text-slate-400">
              Volvé a la lista de expedientes, mantené presionado para
              seleccionar entre 2 y 3, y tocá "Comparar".
            </Text>
            <Pressable
              onPress={handleBack}
              className="mt-8 rounded-xl bg-accent px-6 py-3 shadow-md shadow-accent/20 active:scale-[0.97]"
            >
              <Text className="font-sans-bold text-sm text-white">
                Volver a expedientes
              </Text>
            </Pressable>
          </View>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageContainer scrollable withHeader>
        {isLoading ? (
          <View className="flex-row gap-4 py-6 flex-1">
            {iues.map((_, idx) => (
              <CompareExpedientePanel
                key={idx}
                expediente={null}
                plazosOpen={[]}
                isLoading
                fillWidth={isSideBySide}
              />
            ))}
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="font-sans-bold text-slate-900 dark:text-white">
              Error al cargar
            </Text>
            <Pressable
              onPress={handleBack}
              className="mt-4 rounded-xl bg-slate-200 px-6 py-3 dark:bg-slate-700"
            >
              <Text className="font-sans-semi text-slate-700 dark:text-slate-200">
                Volver
              </Text>
            </Pressable>
          </View>
        ) : isSideBySide ? (
          <View className="flex-1 flex-row gap-3 px-4 py-4">
            {expedientes.map((exp, idx) => (
              <View key={iues[idx] ?? idx} className="flex-1 min-w-0">
                <CompareExpedientePanel
                  expediente={exp}
                  plazosOpen={filterPlazosByIues(
                    agendaItems,
                    iues[idx] ?? "",
                  )}
                  fillWidth
                />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              paddingVertical: 24,
              paddingHorizontal: 24,
            }}
            className="flex-1"
          >
            {expedientes.map((exp, idx) => (
              <View
                key={iues[idx] ?? idx}
                style={{ width: width - 48, marginRight: 16 }}
              >
                <CompareExpedientePanel
                  expediente={exp}
                  plazosOpen={filterPlazosByIues(
                    agendaItems,
                    iues[idx] ?? "",
                  )}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </PageContainer>
    </>
  );
}
