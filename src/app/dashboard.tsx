import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Redirect } from "expo-router";
import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  TrendingDown,
  Zap,
} from "lucide-react-native";
import { useDashboard } from "@hooks/useDashboard";
import { useAccessPolicy } from "@hooks/useAccessPolicy";
import { useSubscription } from "@context/SubscriptionContext";
import { PageContainer, InfoButton } from "@components/ui";
import { DashboardSkeleton } from "@components/features";
import {
  StatCard,
  SectionTitle,
  DeadlineRow,
  DormantRow,
  RecentMovementRow,
} from "@components/features/DashboardSharedComponents";
import { INFO_HINTS } from "@/constants/InfoHints";

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading: isSubscriptionLoading } = useSubscription();
  const { hasPremiumAccess } = useAccessPolicy();
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (!isSubscriptionLoading && !hasPremiumAccess) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <PageContainer withHeader={false}>
      <Stack.Screen options={{ title: "Dashboard" }} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor="#B89146"
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View className="pt-6 pb-4 flex-row items-center">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-accent/10">
              <LayoutDashboard size={20} color="#B89146" />
            </View>
            <View>
              <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-slate-400">
                Estudio Jurídico
              </Text>
              <Text className="text-xl font-sans-bold text-slate-900 dark:text-white">
                Dashboard
              </Text>
            </View>
          </View>
          <InfoButton
            title={INFO_HINTS.stats.title}
            description={INFO_HINTS.stats.description}
            size={18}
          />
        </View>

        {isLoading && (
          <View className="py-4">
            <DashboardSkeleton />
          </View>
        )}

        {isError && (
          <View className="items-center py-20 px-8">
            <AlertTriangle size={36} color="#EF4444" />
            <Text className="mt-3 text-sm font-sans-semi text-slate-500 text-center">
              No se pudo cargar el dashboard
            </Text>
            <Pressable
              className="mt-4 rounded-full bg-accent px-6 py-2.5 active:opacity-70"
              onPress={() => void refetch()}
            >
              <Text className="text-[12px] font-sans-bold text-white">
                Reintentar
              </Text>
            </Pressable>
          </View>
        )}

        {data && (
          <View>
            {/* ── Stats row ────────────────────────────────── */}
            <View className="flex-row gap-3 mb-2">
              <StatCard
                value={data.stats?.totalFollowed ?? 0}
                label="Expedientes seguidos"
                color="#B89146"
              />
              <StatCard
                value={data.stats?.activeInLast30Days ?? 0}
                label="Activos (30d)"
                color="#10B981"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                value={data.stats?.openDeadlines ?? 0}
                label="Plazos abiertos"
                color="#3B82F6"
              />
              <StatCard
                value={data.stats?.urgentDeadlineCount ?? 0}
                label="Urgentes (≤7d)"
                color="#EF4444"
              />
            </View>

            {/* ── Urgent deadlines ─────────────────────────── */}
            {(data.urgentDeadlines?.length ?? 0) > 0 && (
              <>
                <SectionTitle
                  label="Plazos urgentes"
                  icon={AlertTriangle}
                  info={INFO_HINTS.urgentDeadlines}
                />
                {data.urgentDeadlines.map((d) => (
                  <DeadlineRow key={d.id} item={d} />
                ))}
              </>
            )}

            {/* ── Warning deadlines ────────────────────────── */}
            {(data.warningDeadlines?.length ?? 0) > 0 && (
              <>
                <SectionTitle
                  label="Plazos próximos"
                  icon={Clock}
                  info={INFO_HINTS.warningDeadlines}
                />
                {data.warningDeadlines.map((d) => (
                  <DeadlineRow key={d.id} item={d} />
                ))}
              </>
            )}

            {/* ── Recent high-priority movements ───────────── */}
            {(data.recentHighPriorityMovements?.length ?? 0) > 0 && (
              <>
                <SectionTitle
                  label="Movimientos recientes"
                  icon={Zap}
                  info={INFO_HINTS.recentMovements}
                />
                {data.recentHighPriorityMovements.map((m) => (
                  <RecentMovementRow key={`${m.expedienteIue}-${m.fecha}`} item={m} />
                ))}
              </>
            )}

            {/* ── Dormant expedientes ──────────────────────── */}
            {(data.dormantExpedientes?.length ?? 0) > 0 && (
              <>
                <SectionTitle
                  label="Expedientes inactivos"
                  icon={TrendingDown}
                  info={INFO_HINTS.dormantExpedientes}
                />
                {data.dormantExpedientes.map((d) => (
                  <DormantRow key={d.iue} item={d} />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
}
