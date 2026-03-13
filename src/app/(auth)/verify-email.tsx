import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Scale } from "lucide-react-native";
import { verifyEmail, resendVerificationOtp } from "@api/auth.api";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  AuthButton,
  FormField,
  OtpInput,
} from "@components/auth";
import {
  verifyEmailSchema,
  forgotPasswordSchema,
  type VerifyEmailFormData,
} from "@schemas/auth.schema";
import {
  CODE_REQUEST_MESSAGE,
  EMAIL_PLACEHOLDER,
  OTP_INVALID_FALLBACK,
  RESEND_ERROR_FALLBACK,
} from "@constants/auth";
import { extractApiErrorMessage } from "@utils/apiError";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = typeof params.email === "string" ? params.email : "";

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: emailParam, otp: "" },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      setIsLoading(true);
      await verifyEmail(data.email.trim(), data.otp.trim());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Cuenta verificada",
        text2: "Ya podés iniciar sesión.",
      });
      router.replace("/(auth)/login");
    } catch (err: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: extractApiErrorMessage(err, OTP_INVALID_FALLBACK),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const result = forgotPasswordSchema.safeParse({
      email: emailValue?.trim() ?? "",
    });
    if (!result.success) {
      Toast.show({ type: "error", text1: "Ingresá un email válido" });
      return;
    }

    try {
      setIsResending(true);
      setResendSuccess(false);
      await resendVerificationOtp(result.data.email);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResendSuccess(true);
      Toast.show({
        type: "success",
        text1: "Revisá tu correo",
        text2: CODE_REQUEST_MESSAGE,
      });
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: RESEND_ERROR_FALLBACK,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageContainer keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="Verificá tu correo"
        subtitle="Ingresá el código de 6 dígitos que te enviamos por email."
      />

      <View className="px-6 flex-1">
        <AuthFormCard>
          <FormField
            control={control}
            name="email"
            label="Email"
            placeholder={EMAIL_PLACEHOLDER}
            autoCapitalize="none"
            keyboardType="email-address"
            disabled={isLoading}
            error={errors.email?.message}
          />

          <View className="mb-8">
            <Text className="mb-3 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
              Código de verificación
            </Text>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <OtpInput
                  value={value}
                  onChange={onChange}
                  disabled={isLoading}
                />
              )}
            />
            {errors.otp && (
              <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                {errors.otp.message}
              </Text>
            )}
          </View>

          <AuthButton
            label="Verificar cuenta"
            loadingLabel="Verificando..."
            isLoading={isLoading || isResending}
            onPress={handleSubmit(onSubmit)}
            disabled={isResending}
          />
        </AuthFormCard>

        {resendSuccess && (
          <View className="mt-6 mx-2 rounded-2xl border border-success/30 bg-success/10 py-4 px-5">
            <Text className="font-sans text-sm text-success text-center">
              {CODE_REQUEST_MESSAGE}
            </Text>
          </View>
        )}

        <View className="mt-8 flex-row justify-center">
          <Pressable
            onPress={handleResend}
            disabled={isResending}
            hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
            className={`py-4 px-6 active:opacity-70 ${isResending ? "opacity-60" : ""}`}
          >
            <Text className="font-sans text-sm text-accent font-sans-semi">
              {isResending
                ? "Enviando código..."
                : "¿No recibiste el código? Volver a enviar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}
