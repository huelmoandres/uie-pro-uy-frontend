import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Scale } from "lucide-react-native";
import { resetPassword } from "@api/auth.api";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  AuthButton,
  FormField,
  OtpInput,
} from "@components/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@schemas/auth.schema";
import { EMAIL_PLACEHOLDER, OTP_INVALID_FALLBACK } from "@constants/auth";
import { extractApiErrorMessage } from "@utils/apiError";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = typeof params.email === "string" ? params.email : "";

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email.trim(), data.otp.trim(), data.newPassword);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: "Ya podés iniciar sesión con tu nueva contraseña.",
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

  return (
    <PageContainer keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="Nueva contraseña"
        subtitle="Ingresá el código recibido y tu nueva contraseña."
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

          <View className="mb-4">
            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
              Código (6 dígitos)
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

          <FormField
            control={control}
            name="newPassword"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            disabled={isLoading}
            error={errors.newPassword?.message}
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Repetí la contraseña"
            secureTextEntry
            disabled={isLoading}
            error={errors.confirmPassword?.message}
          />

          <AuthButton
            label="Actualizar contraseña"
            loadingLabel="Actualizando..."
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </AuthFormCard>

        <View className="mt-8 flex-row justify-center">
          <Pressable
            onPress={() => router.replace("/(auth)/forgot-password")}
            hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
            className="py-4 px-6 active:opacity-70"
          >
            <Text className="font-sans text-sm text-accent font-sans-semi">
              ¿No recibiste el código? Volver a solicitar
            </Text>
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}
