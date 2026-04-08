import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Share,
  KeyboardAvoidingView,
} from "react-native";
import { Stack } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  Copy,
  Share2,
  CheckCircle,
  Gift,
  Users,
  Info,
  CalendarClock,
  Sparkles,
} from "lucide-react-native";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { useReferralCode, useApplyReferralCode } from "@hooks/useReferrals";
import { APP_NAME } from "@/constants/app.constants";
import { useAuth } from "@context/AuthContext";
import { useSubscription } from "@context/SubscriptionContext";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import { scrollContentBottomPadding } from "@utils/safeAreaLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { referralCodeSchema } from "@schemas/referral.schema";
import type { ReferralCodeForm } from "@app-types/referral.types";
import { useAnalytics } from "@hooks/useAnalytics";
import { getReferralShareMessage } from "@constants/referral";
import {
  getProAccessInfo,
  getReferralOriginLabel,
  getReferralRewardDays,
} from "@utils/referral";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ReferralsScreen() {
  const { user } = useAuth();
  const { isPro, isInTrial, customerInfo } = useSubscription();
  const { data, isLoading } = useReferralCode();
  const applyMutation = useApplyReferralCode();
  const { trackEvent } = useAnalytics();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  // Para USER: referredById tiene el ID del colega. Para PARTNER: referredById es null
  // pero referralType='PARTNER'. Verificamos ambos para cubrir los dos casos.
  const alreadyHasReferrer = !!(user?.referredById || user?.referralType);

  const proAccessInfo = getProAccessInfo(
    customerInfo,
    user ?? null,
    isPro,
    isInTrial,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReferralCodeForm>({
    resolver: zodResolver(referralCodeSchema),
    defaultValues: { code: "" },
  });

  const { field } = useController({ control, name: "code" });

  const handleCopy = async () => {
    if (!data?.code) return;
    await Clipboard.setStringAsync(data.code);
    setCopied(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({ type: "success", text1: "¡Código copiado!" });
    trackEvent("referral_code_copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!data?.code) return;
    const result = await Share.share({
      message: getReferralShareMessage(data.code),
    });
    if (result.action === Share.sharedAction) {
      trackEvent("referral_code_shared");
    }
  };

  const onSubmit = (values: ReferralCodeForm) => {
    applyMutation.mutate(values.code, {
      onSuccess: () => trackEvent("referral_code_applied"),
    });
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ title: "Referidos" }} />
      <KeyboardAvoidingView
        {...KEYBOARD_AVOIDING_VIEW_PROPS}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: scrollContentBottomPadding(insets.bottom, 20),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-4 pt-6">
            {/* Tu acceso Pro — solo se muestra si hay datos reales de RevenueCat */}
            {proAccessInfo.isActive && proAccessInfo.source !== null && (
              <>
                <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                  Tu acceso Pro
                </Text>
                <View className="rounded-3xl bg-white border border-slate-100 dark:bg-slate-900/50 dark:border-white/5 p-5 mb-6">
                  {/* Estado y vencimiento */}
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 items-center justify-center">
                      <CalendarClock size={18} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                        {proAccessInfo.source === "trial"
                          ? "Período de prueba activo"
                          : proAccessInfo.source === "promotional"
                            ? "Acceso promocional activo"
                            : "Suscripción activa"}
                      </Text>
                      {proAccessInfo.expirationDate ? (
                        <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                          {`Vence el ${format(proAccessInfo.expirationDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
                          {proAccessInfo.daysRemaining !== null &&
                            ` · ${proAccessInfo.daysRemaining} ${proAccessInfo.daysRemaining === 1 ? "día" : "días"} restantes`}
                        </Text>
                      ) : (
                        <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                          Acceso activo sin fecha de vencimiento fija
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Origen del acceso si fue referido */}
                  {proAccessInfo.referralOrigin && (
                    <View className="flex-row items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                      <View className="h-10 w-10 rounded-2xl bg-violet-50 dark:bg-violet-500/10 items-center justify-center">
                        <Sparkles size={18} color="#7c3aed" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                          {`${getReferralRewardDays(proAccessInfo.referralOrigin)} días gratis por invitación`}
                        </Text>
                        <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                          {`Obtuviste este beneficio al registrarte con un ${getReferralOriginLabel(proAccessInfo.referralOrigin)}`}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Cómo funciona */}
            <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
              Cómo funciona
            </Text>
            <View className="rounded-3xl bg-white border border-slate-100 dark:bg-slate-900/50 dark:border-white/5 p-5 mb-6">
              <View className="flex-row items-start gap-3 mb-3">
                <View className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-500/20 items-center justify-center mt-0.5">
                  <Text className="text-xs font-sans-bold text-violet-600">
                    1
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    Compartís tu código
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                    Enviá tu código a colegas abogados. Ellos lo ingresan al
                    registrarse en {APP_NAME}.
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <View className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-500/20 items-center justify-center mt-0.5">
                  <Text className="text-xs font-sans-bold text-violet-600">
                    2
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    Tu colega arranca con días gratis
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                    Al registrarse con tu código, recibe días de acceso Pro
                    completamente gratis para explorar la app.
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <View className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-500/20 items-center justify-center mt-0.5">
                  <Text className="text-xs font-sans-bold text-violet-600">
                    3
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    Tu colega se suscribe
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                    Cuando la persona que invitaste activa su suscripción Pro,
                    el sistema lo detecta automáticamente.
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-500/20 items-center justify-center mt-0.5">
                  <Text className="text-xs font-sans-bold text-violet-600">
                    4
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    Ganás 1 mes Pro
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
                    {
                      'Recibís 30 días extra de acceso Pro que se suman al final de tu período actual. Son acumulables: si invitás a 4 personas, tenés 4 meses extra "en el banco".'
                    }
                  </Text>
                </View>
              </View>

              {/* Nota sobre cómo funcionan los días */}
              <View className="flex-row items-start gap-2 bg-amber-50 dark:bg-amber-500/10 rounded-2xl px-4 py-3 mt-4">
                <Info size={15} color="#d97706" className="mt-0.5" />
                <Text className="flex-1 text-xs font-sans text-amber-800 dark:text-amber-300 leading-5">
                  Los meses no reducen el cobro actual de Apple. Se acreditan
                  como una extensión de tu acceso Pro: cuando tu suscripción
                  venza o la canceles, seguís siendo Pro durante los meses
                  acumulados.
                </Text>
              </View>
            </View>

            {/* Tu código de referido */}
            <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
              Tu código
            </Text>
            <View className="rounded-3xl bg-white border border-slate-100 dark:bg-slate-900/50 dark:border-white/5 p-5 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="h-10 w-10 rounded-2xl bg-violet-50 items-center justify-center dark:bg-violet-500/10 mr-3">
                  <Gift size={20} color="#7c3aed" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    Invitá a tus colegas
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                    Compartí tu código y ganás 1 mes por cada suscripción
                  </Text>
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator className="my-4" />
              ) : (
                <>
                  <View className="flex-row items-center justify-between bg-slate-50 dark:bg-white/5 rounded-2xl px-5 py-4 mb-3">
                    <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white tracking-widest">
                      {data?.code ?? "---"}
                    </Text>
                    <Pressable
                      onPress={handleCopy}
                      className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 items-center justify-center active:scale-95"
                    >
                      {copied ? (
                        <CheckCircle size={18} color="#7c3aed" />
                      ) : (
                        <Copy size={18} color="#7c3aed" />
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleShare}
                    className="flex-row items-center justify-center gap-2 bg-violet-600 active:bg-violet-700 rounded-2xl py-3.5"
                  >
                    <Share2 size={18} color="white" />
                    <Text className="text-sm font-sans-bold text-white">
                      Compartir por WhatsApp
                    </Text>
                  </Pressable>
                </>
              )}
            </View>

            {/* Ingresar código */}
            <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
              Código de invitación
            </Text>
            <View className="rounded-3xl bg-white border border-slate-100 dark:bg-slate-900/50 dark:border-white/5 p-5 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="h-10 w-10 rounded-2xl bg-emerald-50 items-center justify-center dark:bg-emerald-500/10 mr-3">
                  <Users size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                    ¿Te invitaron?
                  </Text>
                  <Text className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                    Ingresá el código de quien te invitó al registrarte
                  </Text>
                </View>
              </View>

              {alreadyHasReferrer ? (
                <View className="flex-row items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl px-4 py-3.5">
                  <CheckCircle size={18} color="#059669" />
                  <Text className="text-sm font-sans-semi text-emerald-700 dark:text-emerald-400">
                    ¡Código de invitación aplicado con éxito!
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    value={field.value}
                    onChangeText={(t) => field.onChange(t.toUpperCase())}
                    placeholder="Ej: AB3X9Z"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                    maxLength={6}
                    className="bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-3.5 text-base font-sans-bold text-slate-900 dark:text-white tracking-widest mb-2"
                  />
                  {errors.code && (
                    <Text className="text-xs font-sans text-red-500 mb-2 ml-1">
                      {errors.code.message}
                    </Text>
                  )}
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={applyMutation.isPending}
                    className="flex-row items-center justify-center gap-2 bg-emerald-600 active:bg-emerald-700 rounded-2xl py-3.5 disabled:opacity-60"
                  >
                    {applyMutation.isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-sm font-sans-bold text-white">
                        Aplicar código
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
