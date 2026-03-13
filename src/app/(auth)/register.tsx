import React from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { useForm } from "react-hook-form";
import { Scale } from "lucide-react-native";
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
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
        subtitle="Sumate a UIE Pro Uy"
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
            disabled={isLoading}
            error={errors.email?.message}
          />

          <FormField
            control={control}
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            disabled={isLoading}
            error={errors.password?.message}
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar Contraseña"
            placeholder="••••••••"
            secureTextEntry
            disabled={isLoading}
            error={errors.confirmPassword?.message}
          />

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
