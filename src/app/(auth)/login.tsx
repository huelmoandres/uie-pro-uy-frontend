import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { useForm } from "react-hook-form";
import { Scale } from "lucide-react-native";
import { useLoginMutation } from "@hooks/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@schemas/auth.schema";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  FormField,
  AuthButton,
} from "@components/auth";
import { extractApiErrorMessage } from "@utils/apiError";
import {
  EMAIL_NOT_VERIFIED_MESSAGE,
  LOGIN_ERROR_FALLBACK,
} from "@constants/auth";
import { getDeviceId, getDeviceName } from "@utils/deviceId";
import { isLoginRequiresOtp } from "@api/auth.api";

/**
 * Premium Login Screen
 * Uses deep navy and refined gold palette for a professional look.
 * Follows Rule 12 (SM default).
 */
export default function LoginScreen() {
  const [showVerifyEmailPrompt, setShowVerifyEmailPrompt] = useState(false);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("");

  const { mutateAsync: loginMutation, isPending: isLoading } =
    useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setShowVerifyEmailPrompt(false);
    try {
      const deviceId = await getDeviceId();
      const deviceName = await getDeviceName();
      const result = await loginMutation({
        ...data,
        deviceId,
        deviceName,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isLoginRequiresOtp(result)) {
        router.push({
          pathname: "/(auth)/login-verify-otp",
          params: { tempToken: result.tempToken },
        } as never);
      }
      // Si no requiere OTP: el layout redirige a (tabs) cuando isAuthenticated pasa a true
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = extractApiErrorMessage(error, LOGIN_ERROR_FALLBACK);
      Toast.show({
        type: "error",
        text1: "Error de ingreso",
        text2: msg,
      });
      if (msg === EMAIL_NOT_VERIFIED_MESSAGE) {
        setShowVerifyEmailPrompt(true);
        setPendingVerifyEmail(data.email);
      }
    }
  };

  return (
    <PageContainer keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="UIE Pro Uy"
        subtitle="Gestión Judicial de Alta Gama"
        showBackButton={false}
      />

      <View className="px-6 flex-1">
        <AuthFormCard>
          <FormField
            control={control}
            name="email"
            label="Email Profesional"
            placeholder="ejemplo@estudio.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            disabled={isLoading}
            error={errors.email?.message}
          />
          <View className="mb-8">
            <FormField
              control={control}
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              disabled={isLoading}
              error={errors.password?.message}
            />
            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              className="mt-2 self-end"
            >
              <Text className="text-[11px] font-sans-semi text-accent">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </View>

          <AuthButton
            label="Ingresar"
            loadingLabel="Ingresando..."
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />

          {showVerifyEmailPrompt && (
            <AuthButton
              variant="secondary"
              label="Verificar correo"
              onPress={() => {
                setShowVerifyEmailPrompt(false);
                router.push({
                  pathname: "/(auth)/verify-email",
                  params: { email: pendingVerifyEmail },
                });
              }}
            />
          )}
        </AuthFormCard>

        <View className="mt-10 flex-row justify-center pb-12 px-10">
          <Text className="font-sans text-sm text-slate-600">
            ¿No tenés cuenta?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text className="font-sans-bold text-sm text-accent-dark">
              Registrate
            </Text>
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}
