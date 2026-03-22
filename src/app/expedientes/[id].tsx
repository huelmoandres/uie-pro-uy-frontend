import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
 ScrollView } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  useExpedienteDetail,
  useExpedienteNotes,
  useExportPdf,
  usePremiumGate,
  useUnfollowExpediente,
  useAnalytics,
} from "@hooks";
import {
  ConfirmationModal,
  Skeleton,
  PageContainer,
  LoadMoreButton,
  InfoButton,
} from "@components/ui";
import { INFO_HINTS } from "@/constants/InfoHints";
import {
  MovementItem,
  AgendaWebView,
  ActivityStatusBadge,
  CreateReminderModal,
  PremiumGateModal,
} from "@components/features";
import {
  Trash2,
  ChevronLeft,
  Scale,
  Calendar,
  MapPin,
  Info,
  History,
  FileText,
  Users,
  Pencil,
  Download,
  Bell,
  Lock,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { stripHtml, getYearInAppTimezone } from "@utils/formatters";
import { flattenTimeline } from "@app-types/expediente.types";

// ── Notes editor ──────────────────────────────────────────────────────────────
function NotesEditor({
  iue,
  initialNotes,
}: {
  iue: string;
  initialNotes: string | null;
}) {
  const { mutation, notes: savedNotes } = useExpedienteNotes(iue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Sync draft with saved notes when not editing
  useEffect(() => {
    if (!editing) setDraft(savedNotes ?? initialNotes ?? "");
  }, [savedNotes, initialNotes, editing]);

  const displayText = editing ? draft : (savedNotes ?? initialNotes ?? "");

  const handleEdit = useCallback(() => {
    setDraft(savedNotes ?? initialNotes ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [savedNotes, initialNotes]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setDraft(savedNotes ?? initialNotes ?? "");
  }, [savedNotes, initialNotes]);

  const handleSave = useCallback(() => {
    mutation.mutate(draft.trim() || null, {
      onSuccess: () => {
        setEditing(false);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      },
    });
  }, [mutation, draft]);

  const hasChanges = draft.trim() !== (savedNotes ?? initialNotes ?? "").trim();

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400 flex-1">
          Mis Notas
        </Text>
        <InfoButton
          title={INFO_HINTS.misNotas.title}
          description={INFO_HINTS.misNotas.description}
          size={14}
        />
        {!editing && (
          <Pressable
            onPress={handleEdit}
            hitSlop={8}
            className="flex-row items-center gap-1.5"
          >
            <Pencil size={12} color="#B89146" />
            <Text className="text-[11px] font-sans-semi text-accent">
              {displayText ? "Editar" : "Agregar"}
            </Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className={`rounded-2xl border overflow-hidden ${
            editing
              ? "border-accent/50 bg-white dark:bg-white/5"
              : "border-slate-100 dark:border-white/5 bg-white dark:bg-primary/40"
          }`}
        >
          {editing ? (
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              multiline
              placeholder="Escribí tus notas personales sobre este expediente..."
              placeholderTextColor="#94A3B8"
              className="font-sans text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed p-4"
              style={{ textAlignVertical: "top", minHeight: 96 }}
            />
          ) : displayText ? (
            <Pressable onPress={handleEdit} className="p-4">
              <Text className="font-sans text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {displayText}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleEdit}
              className="p-4 flex-row items-center gap-2"
            >
              <Pencil size={14} color="#94A3B8" />
              <Text className="font-sans text-[13px] text-slate-400">
                Tocá para agregar notas personales...
              </Text>
            </Pressable>
          )}

          {editing && (
            <View className="flex-row border-t border-slate-100 dark:border-white/10">
              <Pressable
                onPress={handleCancel}
                className="flex-1 items-center py-2.5 border-r border-slate-100 dark:border-white/10"
              >
                <Text className="font-sans-semi text-[13px] text-slate-500 dark:text-slate-400">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={mutation.isPending || !hasChanges}
                className={`flex-1 items-center py-2.5 ${
                  hasChanges && !mutation.isPending
                    ? "opacity-100"
                    : "opacity-40"
                }`}
              >
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#B89146" />
                ) : (
                  <Text className="font-sans-semi text-[13px] text-accent">
                    Guardar
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ExpedienteDetailScreen() {
  const { id } = useLocalSearchParams();
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal: showPremiumGateModal,
    featureParam,
    hidePremiumModal,
  } = usePremiumGate();
  const { trackEvent } = useAnalytics();
  const unfollowMutation = useUnfollowExpediente();

  const iue = (id as string).replace(":", "/");

  useEffect(() => {
    trackEvent("expediente_detail_viewed");
  }, [trackEvent]);

  const pdfExporter = useExportPdf();

  const [decreeFilter, setDecreeFilter] = useState<
    "all" | "decree" | "no-decree"
  >("all");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading, isError, refetch, isRefetching } =
    useExpedienteDetail(iue);

  const handleUnfollow = () => {
    setShowUnfollowModal(false);
    unfollowMutation.mutate(id as string);
  };

  const availableYears = useMemo(() => {
    if (!data) return [];
    const flat = flattenTimeline(data.movements);
    const years = new Set(flat.map((m) => getYearInAppTimezone(m.fecha)));
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const filteredMovements = useMemo(() => {
    if (!data) return [];
    return flattenTimeline(data.movements).filter((m) => {
      const matchesDecree =
        decreeFilter === "all"
          ? true
          : decreeFilter === "decree"
            ? m.decree !== null
            : m.decree === null;
      const matchesYear =
        yearFilter === null
          ? true
          : getYearInAppTimezone(m.fecha) === yearFilter;
      return matchesDecree && matchesYear;
    });
  }, [data, decreeFilter, yearFilter]);

  const paginatedMovements = useMemo(
    () => filteredMovements.slice(0, page * PAGE_SIZE),
    [filteredMovements, page],
  );

  const individualCount = filteredMovements.length;

  const handleFilterChange = useCallback(
    (decree: typeof decreeFilter, year: number | null) => {
      setDecreeFilter(decree);
      setYearFilter(year);
      setPage(1);
    },
    [],
  );

  const handleRefresh = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void refetch();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark p-6 pt-20">
        <Skeleton width="40%" height={24} className="mb-6" />
        <Skeleton
          width="100%"
          height={180}
          borderRadius={28}
          className="mb-6"
        />
        <Skeleton width="90%" height={16} className="mb-4" />
        <Skeleton width="80%" height={16} className="mb-4" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-10">
        <Info size={40} color="#EF4444" />
        <Text className="mt-4 text-lg font-sans-bold text-slate-900 dark:text-white">
          No encontrado
        </Text>
        <Text className="mt-2 text-center font-sans text-xs text-slate-500">
          No pudimos obtener la información de este expediente.
        </Text>
        <Pressable
          className="mt-8 rounded-full bg-primary px-6 py-3 dark:bg-accent"
          onPress={() => router.back()}
        >
          <Text className="font-sans-bold text-white dark:text-primary-dark uppercase tracking-widest text-[10px]">
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const item = data;
  const parties = item.parties;
  const prediction = item.prediction;
  const canUsePremiumActions = hasPremiumAccess;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky Header */}
      <View className="z-10 border-b border-slate-100 bg-white/80 px-4 pb-4 pt-14 backdrop-blur-3xl dark:border-white/5 dark:bg-primary/80">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 active:scale-90"
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="#B89146" />
          </Pressable>
          <View className="items-center">
            <Text className="text-[9px] font-sans-bold uppercase tracking-[2px] text-slate-400">
              Detalle Judicial
            </Text>
            <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
              {item.iue}
            </Text>
          </View>
          <View className="h-10 w-10" />
        </View>
      </View>

      <PageContainer
        scrollable={true}
        withHeader={true}
        className="pt-6"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#B89146"
          />
        }
      >
        {/* Main Info Card — compact */}
        <View className="mb-4 rounded-3xl bg-white p-4 border border-slate-100 shadow-sm dark:bg-primary/50 dark:border-white/5">
          {/* Header: icon + IUE + badge */}
          <View className="flex-row items-center gap-3 mb-2.5">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-primary border border-slate-100 dark:border-white/5">
              <Scale size={20} color="#B89146" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                Expediente {item.anio}
              </Text>
              <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white leading-tight">
                {item.iue}
              </Text>
            </View>
            {prediction && (
              <ActivityStatusBadge status={prediction.status} />
            )}
          </View>

          {/* Carátula */}
          <Text
            className="mb-3 font-sans text-[13px] leading-snug text-slate-600 dark:text-slate-300"
            numberOfLines={4}
          >
            {stripHtml(item.caratula) || "Sin carátula registrada en el sistema."}
          </Text>

          {/* Parties — inline compacto */}
          {parties && (parties.plaintiff || parties.defendant) && (
            <View className="mb-2.5 gap-1">
              {parties.plaintiff && (
                <View className="flex-row items-center gap-1.5">
                  <Users size={10} color="#94A3B8" />
                  <Text className="text-[10px] font-sans-bold text-slate-400">
                    Actor:
                  </Text>
                  <Text
                    className="text-[10px] font-sans-semi text-slate-500 dark:text-slate-400 flex-1"
                    numberOfLines={1}
                  >
                    {parties.plaintiff}
                  </Text>
                </View>
              )}
              {parties.defendant && (
                <View className="flex-row items-center gap-1.5">
                  <Users size={10} color="#94A3B8" />
                  <Text className="text-[10px] font-sans-bold text-slate-400">
                    Demandado:
                  </Text>
                  <Text
                    className="text-[10px] font-sans-semi text-slate-500 dark:text-slate-400 flex-1"
                    numberOfLines={1}
                  >
                    {parties.defendant}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Sede + año en una sola fila */}
          <View className="flex-row items-center gap-4 pt-2 border-t border-slate-50 dark:border-white/5">
            <View className="flex-row items-center gap-1.5 flex-1">
              <MapPin size={11} color="#94A3B8" />
              <Text
                className="text-[11px] font-sans text-slate-400 flex-1"
                numberOfLines={1}
              >
                {item.sede}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Calendar size={11} color="#94A3B8" />
              <Text className="text-[11px] font-sans text-slate-400">
                Desde{" "}
                <Text className="font-sans-semi text-slate-600 dark:text-slate-300">
                  {item.anio}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── Movements Timeline ─────────────────────────────── */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2 flex-1">
              <Text className="text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
                Historial de Movimientos
              </Text>
              <InfoButton
                title={INFO_HINTS.timeline.title}
                description={INFO_HINTS.timeline.description}
                size={14}
              />
            </View>
            <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              <History size={10} color="#94A3B8" />
              <Text className="text-[10px] font-sans-semi text-slate-400">
                {individualCount} / {item.totalMovimientos}
              </Text>
            </View>
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingBottom: 14 }}
          >
            {(
              [
                { key: "all", label: "Todos" },
                { key: "decree", label: "Con decreto" },
                { key: "no-decree", label: "Sin decreto" },
              ] as const
            ).map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => handleFilterChange(key, yearFilter)}
                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                  decreeFilter === key
                    ? "border-accent bg-accent"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <Text
                  className={`text-[11px] font-sans-semi ${decreeFilter === key ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}

            {availableYears.map((year) => (
              <Pressable
                key={year}
                onPress={() =>
                  handleFilterChange(
                    decreeFilter,
                    yearFilter === year ? null : year,
                  )
                }
                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                  yearFilter === year
                    ? "border-primary bg-primary"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <Text
                  className={`text-[11px] font-sans-semi ${yearFilter === year ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {year}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* List */}
          {item.movements.length === 0 ? (
            <View className="items-center py-10">
              <FileText size={36} color="#94A3B8" />
              <Text className="mt-3 text-sm font-sans-semi text-slate-400">
                Sin movimientos registrados
              </Text>
            </View>
          ) : filteredMovements.length === 0 ? (
            <View className="items-center py-10">
              <FileText size={36} color="#94A3B8" />
              <Text className="mt-3 text-sm font-sans-semi text-slate-400">
                Sin resultados para los filtros seleccionados
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-primary/50 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-premium dark:shadow-premium-dark px-4 py-3">
              {paginatedMovements.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === paginatedMovements.length - 1;
                const decreeContext = {
                  expedienteIue: item.iue,
                  caratula: item.caratula,
                  movementFecha: entry.fecha,
                  movementTipo: entry.tipo,
                };
                return (
                  <MovementItem
                    key={`${entry.orden}-${index}`}
                    item={entry}
                    isFirst={isFirst}
                    isLast={isLast}
                    decreeContext={decreeContext}
                  />
                );
              })}

              {paginatedMovements.length < filteredMovements.length && (
                <LoadMoreButton
                  onPress={() => setPage((p) => p + 1)}
                  remainingCount={
                    filteredMovements.length - paginatedMovements.length
                  }
                  className="mt-4 mb-2"
                />
              )}
            </View>
          )}
        </View>

        {/* Stats row */}
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
            <View className="flex-row items-center mb-2">
              <History size={14} color="#B89146" />
              <Text className="ml-2 text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                Movimientos
              </Text>
            </View>
            <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white">
              {item.totalMovimientos}
            </Text>
            {item.stats?.averageDaysBetweenMovements != null && (
              <Text className="text-[10px] font-sans text-slate-400 mt-1">
                ~{Math.round(item.stats.averageDaysBetweenMovements)}d entre
                mov.
              </Text>
            )}
          </View>
          <View className="flex-1 rounded-[24px] bg-white p-5 border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/5">
            <View className="flex-row items-center mb-2">
              <View className="h-2 w-2 rounded-full bg-success mr-2" />
              <Text className="text-[10px] font-sans-bold uppercase tracking-[1px] text-slate-400">
                Estado
              </Text>
            </View>
            {prediction ? (
              <ActivityStatusBadge status={prediction.status} />
            ) : (
              <Text className="text-2xl font-sans-bold text-success">
                Activo
              </Text>
            )}
            {prediction?.daysSinceLastActivity != null && (
              <Text className="text-[10px] font-sans text-slate-400 mt-1">
                Último mov. hace {prediction.daysSinceLastActivity}d
              </Text>
            )}
          </View>
        </View>

        {/* Acciones rápidas — fila horizontal compacta */}
        <View className="mb-6 flex-row gap-2">
          <Pressable
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3 px-3 active:opacity-70 ${
              canUsePremiumActions
                ? "border-accent/30 bg-accent/10"
                : "border-amber-300/60 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
            }`}
            onPress={() => {
              if (!canUsePremiumActions) {
                showPremiumModal("reminders");
                return;
              }
              setShowReminderModal(true);
            }}
          >
            {canUsePremiumActions ? (
              <Bell size={14} color="#B89146" />
            ) : (
              <Lock size={13} color="#B89146" />
            )}
            <Text className="font-sans-semi text-[12px] text-accent">
              Recordatorio
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3 px-3 active:opacity-70 ${
              canUsePremiumActions
                ? "border-accent/30 bg-accent/10"
                : "border-amber-300/60 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
            }`}
            onPress={() => {
              if (!canUsePremiumActions) {
                showPremiumModal("agenda-turno");
                return;
              }
              setShowAgenda(true);
            }}
          >
            {canUsePremiumActions ? (
              <Calendar size={14} color="#B89146" />
            ) : (
              <Lock size={13} color="#B89146" />
            )}
            <Text className="font-sans-semi text-[12px] text-accent">
              Agendar Hora
            </Text>
          </Pressable>
        </View>

        {/* ── Notas personales ──────────────────────────────── */}
        <NotesEditor iue={iue} initialNotes={null} />

        {/* Gestión */}
        <View className="mt-4 pb-12">
          <Text className="mb-4 ml-1 text-[10px] font-sans-bold uppercase tracking-[2.5px] text-slate-400">
            Gestión del Expediente
          </Text>

          {/* Export PDF */}
          <Pressable
            className={`mb-3 flex-row items-center justify-between rounded-3xl p-5 border ${
              canUsePremiumActions
                ? "bg-accent/5 border-accent/15 active:bg-accent/10"
                : "bg-amber-50 border-amber-300/50 dark:bg-amber-500/10 dark:border-amber-500/30"
            }`}
            onPress={() => {
              if (!canUsePremiumActions) {
                showPremiumModal("export-pdf");
                return;
              }
              void pdfExporter.export(item);
            }}
            disabled={pdfExporter.isExporting}
          >
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mr-4">
                {canUsePremiumActions ? (
                  <Download size={18} color="#B89146" />
                ) : (
                  <Lock size={16} color="#B89146" />
                )}
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-accent">
                  {pdfExporter.isExporting
                    ? "Generando PDF..."
                    : "Exportar PDF"}
                </Text>
                <Text className="text-[11px] font-sans text-accent/60">
                  Movimientos, notas y estadísticas
                </Text>
              </View>
            </View>
            {pdfExporter.isExporting && (
              <ActivityIndicator size="small" color="#B89146" />
            )}
          </Pressable>

          <Pressable
            className="flex-row items-center justify-between rounded-3xl bg-danger/5 p-5 border border-danger/10 active:bg-danger/10"
            onPress={() => setShowUnfollowModal(true)}
          >
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10 mr-4">
                <Trash2 size={18} color="#EF4444" />
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-danger">
                  Dejar de seguir
                </Text>
                <Text className="text-[11px] font-sans text-danger/60">
                  Eliminar de mi monitor personal
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </PageContainer>

      <ConfirmationModal
        visible={showUnfollowModal}
        title="Quitar Expediente"
        description="¿Estás seguro que deseás dejar de seguir este expediente?"
        confirmText="Sí, quitar"
        cancelText="Mantener"
        type="danger"
        onConfirm={handleUnfollow}
        onCancel={() => setShowUnfollowModal(false)}
      />

      <Modal
        visible={showAgenda}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setShowAgenda(false)}
      >
        <AgendaWebView
          iues={[item.iue]}
          sede={item.sede}
          onClose={() => setShowAgenda(false)}
          onBookingComplete={(payload) => {
            setShowAgenda(false);
            if (payload.success) {
              Toast.show({
                type: "success",
                text1: "¡Turno agendado!",
                text2: payload.confirmationCode
                  ? `Código: ${payload.confirmationCode}`
                  : "Tu turno fue registrado exitosamente.",
              });
            }
          }}
        />
      </Modal>

      <CreateReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        iue={item.iue}
        caratula={item.caratula ?? null}
      />

      <PremiumGateModal
        visible={showPremiumGateModal}
        onClose={hidePremiumModal}
        feature={featureParam}
      />
    </View>
  );
}
