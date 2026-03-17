import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ScrollView } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Scale } from "lucide-react-native";
import { useVerifyLoginOtpMutation } from "@hooks/useAuthMutations";
import { PageContainer } from "@components/ui";
import {
  AuthScreenHeader,
  AuthFormCard,
  AuthButton,
  OtpInput,
} from "@components/auth";
import { otpSchema } from "@schemas/auth.schema";
import { z } from "zod";
import { extractApiErrorMessage } from "@utils/apiError";

const loginVerifyOtpSchema = z.object({ otp: otpSchema });

type LoginVerifyOtpFormData = z.infer<typeof loginVerifyOtpSchema>;

export default function LoginVerifyOtpScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ tempToken?: string }>();
  const tempToken = typeof params.tempToken === "string" ? params.tempToken : "";

  const { mutateAsync: verifyOtpMutation, isPending: isLoading } =
    useVerifyLoginOtpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginVerifyOtpFormData>({
    resolver: zodResolver(loginVerifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (data: LoginVerifyOtpFormData) => {
    if (!tempToken) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Sesión expirada. Volvé a iniciar sesión.",
      });
      router.replace("/(auth)/login");
      return;
    }

    try {
      await verifyOtpMutation({ tempToken, otp: data.otp });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // El layout redirige a (tabs) cuando isAuthenticated pasa a true
    } catch (err: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Código inválido",
        text2: extractApiErrorMessage(err, "El código es incorrecto o expiró."),
      });
    }
  };

  return (
    <PageContainer ref={scrollRef} keyboardAware={true} className="px-0">
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        icon={Scale}
        title="Autorizar dispositivo"
        subtitle="Ingresá el código de 6 dígitos que te enviamos a tu correo para completar el inicio de sesión."
      />

      <View className="px-6 flex-1">
        <AuthFormCard>
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
                  onComplete={handleSubmit(onSubmit)}
                  scrollViewRef={scrollRef}
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
            label="Continuar"
            loadingLabel="Verificando..."
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </AuthFormCard>
      </View>
    </PageContainer>
  );
}
