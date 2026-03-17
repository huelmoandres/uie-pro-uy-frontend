import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Keyboard, Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Scale } from "lucide-react-native";
import { forgotPassword } from "@api/auth.api";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  AuthButton,
  FormField,
} from "@components/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@schemas/auth.schema";
import {
  CODE_REQUEST_MESSAGE,
  EMAIL_PLACEHOLDER,
  FORGOT_PASSWORD_ERROR_FALLBACK,
} from "@constants/auth";
import { extractApiErrorMessage } from "@utils/apiError";

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    Keyboard.dismiss();
    try {
      setIsLoading(true);
      const email = data.email.trim();
      if (!email) return;
      await forgotPassword(email);
      setSent(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Revisá tu correo",
        text2: CODE_REQUEST_MESSAGE,
      });
    } catch (err: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: extractApiErrorMessage(err, FORGOT_PASSWORD_ERROR_FALLBACK),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToReset = () => {
    router.replace(
      `/(auth)/reset-password?email=${encodeURIComponent(emailValue?.trim() ?? "")}`,
    );
  };

  return (
    <PageContainer keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="Recuperar contraseña"
        subtitle="Ingresá tu email. Si está registrado, te enviamos un código de 6 dígitos."
      />

      <View className="px-6 flex-1">
        <AuthFormCard>
          {!sent ? (
            <>
              <FormField
                control={control}
                name="email"
                label="Email"
                placeholder={EMAIL_PLACEHOLDER}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                disabled={isLoading}
                error={errors.email?.message}
              />
              <AuthButton
                label="Enviar código"
                loadingLabel="Enviando..."
                isLoading={isLoading}
                onPress={handleSubmit(onSubmit)}
              />
            </>
          ) : (
            <>
              <Text className="text-sm font-sans text-slate-600 dark:text-slate-400 text-center mb-6">
                {CODE_REQUEST_MESSAGE}
              </Text>
              <AuthButton label="Ingresar código" onPress={goToReset} />
            </>
          )}
        </AuthFormCard>

        <View className="mt-8 flex-row justify-center">
          <Pressable onPress={() => router.back()}>
            <Text className="font-sans text-sm text-slate-500 dark:text-slate-400">
              Volver al inicio de sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </PageContainer>
  );
}
