import React from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { useForm, useWatch } from "react-hook-form";
import { Scale, Gift } from "lucide-react-native";
import { APP_NAME } from "@/constants/app.constants";
import { useRegisterMutation } from "@hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@schemas/auth.schema";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  FormField,
  AuthButton,
} from "@components/auth";
import { extractApiErrorMessage } from "@utils/apiError";
import { REGISTER_ERROR_FALLBACK } from "@constants/auth";

/**
 * Premium Register Screen
 * Consistent with LoginScreen aesthetics and Rule 12 (SM).
 */
export default function RegisterScreen() {
  const { mutateAsync: registerMutation, isPending: isLoading } =
    useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const referralCodeValue = useWatch({ control, name: "referralCode" });
  const referralCodeReady = (referralCodeValue ?? "").length === 6;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, referralCode, ...rest } = data;
      const registerData = {
        ...rest,
        ...(referralCode ? { referralCode } : {}),
      };
      const result = await registerMutation(registerData);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Revisá tu correo",
        text2: result.message,
      });
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: result.email },
      });
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error de registro",
        text2: extractApiErrorMessage(error, REGISTER_ERROR_FALLBACK),
      });
    }
  };

  return (
    <PageContainer keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="Crear Cuenta"
        subtitle={`Sumate a ${APP_NAME}`}
        showBackButton={true}
      />

      <View className="flex-1 px-6">
        <AuthFormCard>
          <FormField
            control={control}
            name="name"
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez"
            autoCapitalize="words"
            disabled={isLoading}
            error={errors.name?.message}
          />
          <FormField
            control={control}
            name="email"
            label="Correo Electrónico"
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            disabled={isLoading}
            error={errors.email?.message}
          />

          <FormField
            control={control}
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            disabled={isLoading}
            error={errors.password?.message}
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar Contraseña"
            placeholder="••••••••"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            disabled={isLoading}
            error={errors.confirmPassword?.message}
          />

          <FormField
            control={control}
            name="referralCode"
            label="Código de invitación (opcional)"
            placeholder="Ej: AB3X9Z"
            autoCapitalize="characters"
            maxLength={6}
            disabled={isLoading}
            error={errors.referralCode?.message}
          />
          {referralCodeReady ? (
            <View className="flex-row items-center gap-1.5 -mt-2 ml-1 mb-4">
              <Gift size={13} color="#059669" />
              <Text className="text-xs font-sans-bold text-emerald-600 dark:text-emerald-400">
                ¡Código listo! Arrancás con días de Pro gratis al crear tu
                cuenta.
              </Text>
            </View>
          ) : (
            <Text className="text-xs font-sans text-slate-400 dark:text-slate-500 -mt-2 ml-1 mb-4">
              Si te compartieron un código, ingresalo y arrancás con días de Pro
              gratis.
            </Text>
          )}

          <AuthButton
            label="Crear Cuenta"
            loadingLabel="Registrando..."
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </AuthFormCard>

        <View className="mt-10 flex-row justify-center pb-12 px-10">
          <Text className="font-sans text-sm text-slate-600">
            ¿Ya tenés cuenta?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text className="font-sans-bold text-sm text-accent-dark">
              Ingresá acá
            </Text>
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}
