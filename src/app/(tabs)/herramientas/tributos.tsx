import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import {
  Search,
  FileQuestion,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
} from "lucide-react-native";
import { PageContainer, Skeleton } from "@components/ui";
import { TributoCard } from "@components/features";
import { useTributos } from "@hooks";
import {
  filterTributos,
  getTributosYearOptions,
  getTributosDefaultYear,
  buildTributosDisclaimer,
} from "@utils/tributos.utils";
import type { ITributo } from "@app-types/tributo.types";

function TributoSkeleton() {
  return (
    <View className="mb-3 overflow-hidden rounded-[24px] bg-white p-4 border border-slate-100 dark:bg-slate-900/40 dark:border-white/5">
      <View className="flex-row items-center justify-between">
        <Skeleton width={180} height={16} borderRadius={8} />
        <Skeleton width={80} height={24} borderRadius={8} />
      </View>
    </View>
  );
}

const YEAR_OPTIONS = getTributosYearOptions();
const DEFAULT_YEAR = getTributosDefaultYear();

export default function TributosScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [showYearModal, setShowYearModal] = useState(false);

  const {
    data: tributos = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTributos({ year: selectedYear });

  const filteredTributos = useMemo(
    () => filterTributos(tributos, searchQuery),
    [tributos, searchQuery]
  );

  const displayYear = tributos[0]?.year ?? getTributosDefaultYear();
  const disclaimer = buildTributosDisclaimer(displayYear);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ITributo }) => (
      <TributoCard
        item={item}
        isExpanded={expandedId === item.id}
        onToggle={() => handleToggleExpand(item.id)}
      />
    ),
    [expandedId, handleToggleExpand]
  );

  const fixedFooter = (
    <View
      className="border-t border-slate-100 bg-white px-5 pt-3 dark:bg-primary dark:border-white/5"
      style={{
        marginBottom: -insets.bottom,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <Text className="text-center text-[11px] font-sans text-slate-500 dark:text-slate-400">
        {disclaimer}
      </Text>
    </View>
  );

  const ListEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <FileQuestion size={48} color="#94A3B8" />
        <Text className="mt-4 font-sans-semi text-slate-600 dark:text-slate-300">
          No encontramos ese acto procesal
        </Text>
        <Text className="mt-2 px-8 text-center text-[12px] font-sans text-slate-500 dark:text-slate-400">
          Probá buscar con otras palabras
        </Text>
      </View>
    ),
    []
  );

  const headerSection = (
    <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 active:scale-95"
        >
          <ArrowLeft size={20} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-[22px] font-sans-bold text-slate-900 dark:text-white mt-0.5">
            Tributos Judiciales
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-2.5">
        <View className="flex-1 h-11 flex-row items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5 dark:border-white/10 dark:bg-white/5">
          <Search size={16} color="#94A3B8" />
          <TextInput
            className="flex-1 px-2.5 font-sans text-[14px] text-slate-900 dark:text-white"
            placeholder="Buscar acto procesal..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowYearModal(true);
          }}
          className="h-11 min-w-[72px] flex-row items-center justify-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/5 active:scale-95"
        >
          <Text className="font-sans-semi text-[14px] text-slate-900 dark:text-white">
            {selectedYear}
          </Text>
          <ChevronDown size={16} color="#64748B" />
        </Pressable>
      </View>

      <Modal
        visible={showYearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearModal(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowYearModal(false)}
        >
          <Pressable
            className="rounded-t-2xl bg-white p-4 dark:bg-slate-900"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-3 font-sans-bold text-slate-900 dark:text-white">
              Año de vigencia
            </Text>
            <ScrollView className="max-h-48">
              {YEAR_OPTIONS.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedYear(y);
                    setShowYearModal(false);
                  }}
                  className={`rounded-xl px-4 py-3 ${
                    y === selectedYear
                      ? "bg-accent/15 dark:bg-accent/20"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`font-sans-semi ${
                      y === selectedYear
                        ? "text-accent dark:text-accent-light"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {y}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {headerSection}
        <PageContainer withHeader={true}>
          <View className="flex-1">
            <View className="pt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TributoSkeleton key={i} />
              ))}
            </View>
            {fixedFooter}
          </View>
        </PageContainer>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {headerSection}
        <PageContainer withHeader={true}>
          <View className="flex-1">
            <View className="flex-1 items-center justify-center py-20">
              <RefreshCw size={40} color="#EF4444" />
              <Text className="mt-4 font-sans-bold text-slate-900 dark:text-white">
                Error al cargar
              </Text>
              <Pressable
                onPress={() => void refetch()}
                className="mt-4 rounded-full bg-slate-200 px-6 py-2 dark:bg-white/10"
              >
                <Text className="text-xs font-sans-bold text-slate-900 dark:text-white">
                  Reintentar
                </Text>
              </Pressable>
            </View>
            {fixedFooter}
          </View>
        </PageContainer>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {headerSection}

      <PageContainer withHeader={true}>
        <View className="flex-1">
          {filteredTributos.length === 0 ? (
            <ListEmpty />
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="flex-1"
            >
              <FlashList
                data={filteredTributos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onRefresh={() => void refetch()}
                refreshing={isRefetching}
              />
            </KeyboardAvoidingView>
          )}
          {fixedFooter}
        </View>
      </PageContainer>
    </View>
  );
}
