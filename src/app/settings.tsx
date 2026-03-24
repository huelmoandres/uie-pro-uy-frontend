import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
} from "react-native";
import { Stack, router } from "expo-router";
import { useAppColorScheme } from "@hooks/useAppColorScheme";
import { useBiometric } from "@hooks/useBiometric";
import {
  Monitor,
  Moon,
  Sun,
  Check,
  User as UserIcon,
  Phone,
  CreditCard,
  Save,
  X,
  Tag,
  Lock,
  ChevronRight,
  Trash2,
  RotateCcw,
  Bug,
  ScanFace,
  Fingerprint,
} from "lucide-react-native";
import { useAuth } from "@context/AuthContext";
import { useOnboarding } from "@context/OnboardingContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@schemas/auth.schema";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { ManageTagsModal, PremiumGateModal } from "@components/features";
import { usePremiumGate, useUpdateProfile, useDeleteAccount } from "@hooks";
import { InfoButton, ConfirmationModal } from "@components/ui";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import { INFO_HINTS } from "@constants/InfoHints";
import {
  isSimulateCancelledTrialEnabled,
  setSimulateCancelledTrial,
} from "@utils/debugSubscription";
import * as Updates from "expo-updates";

export default function SettingsScreen() {
  const {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal: showPremiumGateModal,
    featureParam,
    hidePremiumModal,
  } = usePremiumGate();
  const { user, isAuthenticated } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const {
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
  } = useBiometric(isAuthenticated);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { colorScheme, setColorScheme } = useAppColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const [manageTagsVisible, setManageTagsVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();
  const [debugSimulateEnabled, setDebugSimulateEnabled] = useState(false);
  const [debugSimulateLoading, setDebugSimulateLoading] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      isSimulateCancelledTrialEnabled().then(setDebugSimulateEnabled);
    }
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      cedula: user?.cedula || "",
    },
  });

  const onEditPress = () => {
    reset({
      name: user?.name || "",
      phone: user?.phone || "",
      cedula: user?.cedula || "",
    });
    setIsEditing(true);
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleDeleteAccount = () => {
    if (deleteAccountMutation.isPending) return;
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => setDeleteAccountModalVisible(false),
    });
  };

  const options = [
    { label: "Claro", value: "light", icon: Sun },
    { label: "Oscuro", value: "dark", icon: Moon },
    { label: "Sistema", value: "system", icon: Monitor },
  ] as const;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ title: "Configuración" }} />
      <KeyboardAvoidingView
        {...KEYBOARD_AVOIDING_VIEW_PROPS}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-4 pt-6">
            {/* User Profile Section */}
            <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
              Mi Perfil
            </Text>
            <View className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-premium dark:bg-slate-900/50 dark:border-white/5 p-5 mb-8">
              {!isEditing ? (
                <>
                  <View className="flex-row items-center mb-6">
                    <View className="h-14 w-14 rounded-2xl bg-slate-50 items-center justify-center dark:bg-white/5">
                      <UserIcon size={28} color="#B89146" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text
                        className="text-lg font-sans-bold text-slate-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {user?.name || "Usuario"}
                      </Text>
                      <Text
                        className="text-xs font-sans text-slate-400"
                        numberOfLines={1}
                      >
                        {user?.email}
                      </Text>
                    </View>
                    <Pressable
                      onPress={onEditPress}
                      className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 active:scale-95"
                    >
                      <Text className="text-xs font-sans-bold text-accent">
                        EDITAR
                      </Text>
                    </Pressable>
                  </View>

                  <View className="space-y-4">
                    <View className="flex-row items-center">
                      <View className="h-8 w-8 rounded-lg bg-emerald-50 items-center justify-center dark:bg-emerald-500/10 mr-3">
                        <Phone size={14} color="#10B981" />
                      </View>
                      <View>
                        <Text className="text-[10px] font-sans text-slate-400 uppercase tracking-tighter">
                          Teléfono
                        </Text>
                        <Text className="text-sm font-sans-semi text-slate-700 dark:text-slate-300">
                          {user?.phone || "No especificado"}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-4">
                      <View className="h-8 w-8 rounded-lg bg-blue-50 items-center justify-center dark:bg-blue-500/10 mr-3">
                        <CreditCard size={14} color="#3B82F6" />
                      </View>
                      <View>
                        <Text className="text-[10px] font-sans text-slate-400 uppercase tracking-tighter">
                          Cédula
                        </Text>
                        <Text className="text-sm font-sans-semi text-slate-700 dark:text-slate-300">
                          {user?.cedula || "No especificado"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View>
                  <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-base font-sans-bold text-slate-900 dark:text-white">
                      Editar Información
                    </Text>
                    <Pressable
                      onPress={() => setIsEditing(false)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5"
                    >
                      <X size={16} color="#64748B" />
                    </Pressable>
                  </View>

                  <View className="space-y-4">
                    <View>
                      <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">
                        Nombre
                      </Text>
                      <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            className={`rounded-xl bg-slate-50 border ${errors.name ? "border-danger" : "border-slate-100"} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            editable={!updateProfileMutation.isPending}
                          />
                        )}
                      />
                      {errors.name?.message && (
                        <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                          {errors.name.message}
                        </Text>
                      )}
                    </View>

                    <View className="mt-4">
                      <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">
                        Teléfono
                      </Text>
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            className={`rounded-xl bg-slate-50 border ${errors.phone ? "border-danger" : "border-slate-100"} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9]/g, ""))
                            }
                            value={value || ""}
                            keyboardType="phone-pad"
                            editable={!updateProfileMutation.isPending}
                          />
                        )}
                      />
                      {errors.phone?.message && (
                        <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                          {errors.phone.message}
                        </Text>
                      )}
                    </View>

                    <View className="mt-4">
                      <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">
                        Cédula
                      </Text>
                      <Controller
                        control={control}
                        name="cedula"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            className={`rounded-xl bg-slate-50 border ${errors.cedula ? "border-danger" : "border-slate-100"} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9]/g, ""))
                            }
                            value={value || ""}
                            keyboardType="number-pad"
                            editable={!updateProfileMutation.isPending}
                          />
                        )}
                      />
                      {errors.cedula?.message && (
                        <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                          {errors.cedula.message}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={updateProfileMutation.isPending}
                    className="mt-8 flex-row items-center justify-center rounded-2xl bg-accent py-3.5 shadow-lg shadow-accent/30 active:scale-[0.98] disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Save size={16} color="white" className="mr-2" />
                        <Text className="text-xs font-sans-bold uppercase tracking-widest text-white ml-2">
                          GUARDAR CAMBIOS
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {/* Mis Etiquetas section */}
            <View className="flex-row items-center ml-2 mb-2 mt-4">
              <Text className="flex-1 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                Mis Etiquetas
              </Text>
              <InfoButton
                title={INFO_HINTS.etiquetas.title}
                description={INFO_HINTS.etiquetas.description}
              />
            </View>
            <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-8">
              <Pressable
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!hasPremiumAccess) {
                    showPremiumModal("tags");
                    return;
                  }
                  setManageTagsVisible(true);
                }}
                className="flex-row items-center p-4 active:bg-slate-50 dark:active:bg-white/5"
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                  <Tag size={16} color="#B89146" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[15px] font-sans-semi text-slate-700 dark:text-slate-300">
                      Gestionar etiquetas
                    </Text>
                    {!hasPremiumAccess && <Lock size={12} color="#94A3B8" />}
                  </View>
                  <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                    Crear, editar y eliminar tus etiquetas de color
                  </Text>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
              </Pressable>
            </View>

            {isBiometricAvailable && (
              <>
                <Text className="ml-2 mb-2 mt-4 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                  Seguridad
                </Text>
                <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-8">
                  <View className="flex-row items-center p-4">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                      {biometricType === "faceid" ||
                      biometricType === "iris" ? (
                        <ScanFace size={16} color="#3B82F6" />
                      ) : (
                        <Fingerprint size={16} color="#3B82F6" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-sans-semi text-slate-700 dark:text-slate-300">
                        {biometricType === "faceid"
                          ? "Face ID"
                          : biometricType === "iris"
                            ? "Iris"
                            : "Huella dactilar"}
                      </Text>
                      <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                        Desbloquear la app al volver de background
                      </Text>
                    </View>
                    {biometricLoading ? (
                      <ActivityIndicator size="small" color="#B89146" />
                    ) : (
                      <Switch
                        value={isBiometricEnabled}
                        onValueChange={async (value) => {
                          setBiometricLoading(true);
                          if (value) {
                            await enableBiometric();
                          } else {
                            await disableBiometric();
                          }
                          setBiometricLoading(false);
                        }}
                        trackColor={{ false: "#E2E8F0", true: "#B89146" }}
                        thumbColor="white"
                      />
                    )}
                  </View>
                </View>
              </>
            )}

            <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
              Apariencia
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
              {options.map((option, index) => {
                const Icon = option.icon;
                const isSelected = colorScheme === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => void setColorScheme(option.value)}
                    className={`flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 ${
                      index !== options.length - 1
                        ? "border-b border-slate-50 dark:border-white/5"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5">
                        <Icon
                          size={16}
                          color={isSelected ? "#B89146" : "#64748B"}
                        />
                      </View>
                      <Text
                        className={`font-sans-semi text-[15px] ${
                          isSelected
                            ? "text-accent"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color="#B89146" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Dev: Ver onboarding de nuevo */}
          {__DEV__ && (
            <View className="mt-6 px-4 gap-3">
              <Pressable
                onPress={async () => {
                  await resetOnboarding();
                  Toast.show({
                    type: "info",
                    text1: "Onboarding reseteado",
                    text2: "Volvé al inicio para verlo de nuevo.",
                  });
                  router.replace("/onboarding");
                }}
                className="flex-row items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-3 dark:border-white/10 dark:bg-white/5 active:opacity-70"
              >
                <RotateCcw size={16} color="#64748B" />
                <Text className="font-sans-semi text-slate-600 text-sm ml-2 dark:text-slate-400">
                  Ver onboarding de nuevo
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setDebugSimulateLoading(true);
                  try {
                    const next = !debugSimulateEnabled;
                    await setSimulateCancelledTrial(next);
                    setDebugSimulateEnabled(next);
                    Toast.show({
                      type: "info",
                      text1: next
                        ? "Simulación activada"
                        : "Simulación desactivada",
                      text2: next
                        ? "Recargando para reproducir error 'stale'..."
                        : "Recargando...",
                    });
                    if (typeof Updates.reloadAsync === "function") {
                      await Updates.reloadAsync();
                    } else {
                      Toast.show({
                        type: "info",
                        text1: "Cerrá y volvé a abrir la app",
                      });
                    }
                  } catch {
                    Toast.show({
                      type: "error",
                      text1: "Error",
                      text2: "Cerrá y volvé a abrir la app manualmente.",
                    });
                  } finally {
                    setDebugSimulateLoading(false);
                  }
                }}
                disabled={debugSimulateLoading}
                className="flex-row items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 py-3 dark:border-amber-900/50 dark:bg-amber-950/30 active:opacity-70"
              >
                {debugSimulateLoading ? (
                  <ActivityIndicator size="small" color="#B45309" />
                ) : (
                  <Bug size={16} color="#B45309" />
                )}
                <Text className="font-sans-semi text-amber-800 text-sm ml-2 dark:text-amber-400">
                  {debugSimulateEnabled
                    ? "Desactivar simulación trial cancelado"
                    : "Simular trial cancelado (reproducir error stale)"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Eliminar cuenta — Apple Guideline 5.1.1(v) */}
          <View className="mt-8 mb-12 px-4">
            <Pressable
              onPress={() => setDeleteAccountModalVisible(true)}
              className="flex-row items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 py-4 active:bg-danger/20"
            >
              <Trash2 size={20} color="#EF4444" />
              <Text className="font-sans-bold text-danger text-sm ml-3">
                Eliminar cuenta
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={deleteAccountModalVisible}
        title="¿Eliminar cuenta?"
        description="Esta acción es irreversible. Se borrarán todos tus datos: expedientes seguidos, recordatorios, etiquetas y preferencias. No podrás recuperar tu cuenta."
        confirmText="Sí, eliminar mi cuenta"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteAccountModalVisible(false)}
      />

      <ManageTagsModal
        visible={manageTagsVisible}
        onClose={() => setManageTagsVisible(false)}
      />

      <PremiumGateModal
        visible={showPremiumGateModal}
        onClose={hidePremiumModal}
        feature={featureParam}
      />
    </View>
  );
}
