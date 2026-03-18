import React from "react";
import { View, Modal } from "react-native";
import Toast from "react-native-toast-message";
import {
  FollowExpedienteModal,
  ExpedientesFilterModal,
  ExpedientesHeader,
  ExpedienteSelectionBar,
  ExpedientesContent,
  AgendaWebView,
  TagPickerModal,
  CreateReminderModal,
} from "@components/features";
import { useExpedientesScreen } from "@hooks";

export default function ExpedientesScreen() {
  const screen = useExpedientesScreen();

  const {
    searchText,
    setSearchText,
    activeTab,
    showFollowModal,
    setShowFollowModal,
    showFilterModal,
    setShowFilterModal,
    selectedIues,
    showBulkAgenda,
    setShowBulkAgenda,
    queryParams,
    setQueryParams,
    tagPickerIue,
    setTagPickerIue,
    reminderModalItem,
    setReminderModalItem,
    hasActiveFilters,
    expedientes,
    paginationMeta,
    isLoading,
    isError,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    canCompare,
    handleTabChange,
    handleRefresh,
    handleLoadMore,
    handlePin,
    toggleSelection,
    clearSelection,
    handleBulkAgenda,
    handleCompare,
  } = screen;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ExpedientesHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddPress={() => setShowFollowModal(true)}
        onFilterPress={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
        totalItems={paginationMeta?.totalItems}
      />

      <ExpedientesContent
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        expedientes={expedientes}
        activeTab={activeTab}
        selectedIues={selectedIues}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        onAddPress={() => setShowFollowModal(true)}
        onSelect={toggleSelection}
        onPin={handlePin}
        onTagsPress={setTagPickerIue}
        onAddReminder={setReminderModalItem}
      />

      <View className="bg-white dark:bg-primary border-t border-slate-200/60 dark:border-white/10 z-10 px-5 pt-3 pb-4">
        <ExpedienteSelectionBar
          selectedCount={selectedIues.length}
          canCompare={canCompare}
          onCompare={handleCompare}
          onBulkAgenda={handleBulkAgenda}
          onClearSelection={clearSelection}
          paginationMeta={paginationMeta}
          onLoadMore={handleLoadMore}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          hasExpedientes={expedientes.length > 0}
        />
      </View>

      <FollowExpedienteModal
        visible={showFollowModal}
        onClose={() => setShowFollowModal(false)}
      />

      <ExpedientesFilterModal
        visible={showFilterModal}
        currentFilters={queryParams}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => setQueryParams({ ...filters })}
      />

      <Modal
        visible={showBulkAgenda}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowBulkAgenda(false)}
      >
        <AgendaWebView
          iues={selectedIues}
          sede={expedientes.find((e) => e.iue === selectedIues[0])?.sede ?? ""}
          onClose={() => setShowBulkAgenda(false)}
          onBookingComplete={(payload) => {
            setShowBulkAgenda(false);
            if (payload.success) {
              clearSelection();
              Toast.show({
                type: "success",
                text1: "¡Turno agendado!",
                text2: "Tu turno múltiple fue registrado exitosamente.",
              });
            }
          }}
        />
      </Modal>

      <TagPickerModal
        visible={!!tagPickerIue}
        iue={tagPickerIue ?? ""}
        assignedTagIds={
          expedientes
            .find((e) => e.iue === tagPickerIue)
            ?.tags?.map((t) => t.id) ?? []
        }
        onClose={() => setTagPickerIue(null)}
      />

      <CreateReminderModal
        visible={reminderModalItem != null}
        onClose={() => setReminderModalItem(null)}
        iue={reminderModalItem?.iue ?? null}
        caratula={reminderModalItem?.caratula ?? null}
      />
    </View>
  );
}
