import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { MessageSquare, X, User, Mail, AlignLeft } from "lucide-react-native";
import {
  contactSupportSchema,
  type ContactSupportFormData,
} from "@schemas/support.schema";
import { useSupportMutation } from "@hooks/useSupportMutation";
import { useModalKeyboardDismiss } from "@hooks/useModalKeyboardDismiss";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import { useAuth } from "@context/AuthContext";

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet modal to send a support message.
 * Pre-fills name/email from the authenticated user.
 * Full light/dark mode support per ai-rules.md.
 */
export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const { mutateAsync, isPending } = useSupportMutation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactSupportFormData>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      message: "",
    },
  });

  // Sync user data when it loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        email: user.email ?? "",
        message: "",
      });
    }
  }, [user, reset]);

  useModalKeyboardDismiss(visible);

  const handleClose = () => {
    reset({ name: user?.name ?? "", email: user?.email ?? "", message: "" });
    onClose();
  };

  const onSubmit = async (data: ContactSupportFormData) => {
    try {
      await mutateAsync(data);

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      handleClose();

      Toast.show({
        type: "success",
        text1: "Mensaje enviado",
        text2: "Nos pondremos en contacto a la brevedad.",
      });
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("message", {
        type: "manual",
        message: "No se pudo enviar el mensaje. Intentá de nuevo.",
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <View style={styles.backdropDim} />
        </Pressable>

        <KeyboardAvoidingView
          {...KEYBOARD_AVOIDING_VIEW_PROPS}
          className="w-full"
        >
          <View className="w-full overflow-hidden rounded-t-[36px] bg-white dark:bg-surface-dark border border-b-0 border-slate-200 dark:border-white/5 shadow-2xl px-6 pt-6 pb-10">
            {/* Handle */}
            <View className="items-center mb-5">
              <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-7">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-[16px] bg-accent/10">
                  <MessageSquare size={20} color="#B89146" />
                </View>
                <View>
                  <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
                    Centro de Ayuda
                  </Text>
                  <Text className="text-lg font-sans-bold text-slate-900 dark:text-white leading-tight">
                    Enviar Mensaje
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 active:opacity-70"
              >
                <X size={16} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Name */}
              <View className="mb-4">
                <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-slate-400">
                  Nombre
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`flex-row items-center rounded-2xl border px-4 ${errors.name ? "border-danger bg-danger/5" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                    >
                      <User
                        size={16}
                        color={errors.name ? "#EF4444" : "#94A3B8"}
                      />
                      <TextInput
                        className="flex-1 px-3 py-3 font-sans text-[14px] text-slate-900 dark:text-white"
                        placeholder="Tu nombre completo"
                        placeholderTextColor="#94A3B8"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        returnKeyType="next"
                        editable={!isPending}
                      />
                    </View>
                  )}
                />
                {errors.name && (
                  <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                    {errors.name.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-slate-400">
                  Correo Electrónico
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`flex-row items-center rounded-2xl border px-4 ${errors.email ? "border-danger bg-danger/5" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                    >
                      <Mail
                        size={16}
                        color={errors.email ? "#EF4444" : "#94A3B8"}
                      />
                      <TextInput
                        className="flex-1 px-3 py-3 font-sans text-[14px] text-slate-900 dark:text-white"
                        placeholder="tu@email.com"
                        placeholderTextColor="#94A3B8"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="next"
                        editable={!isPending}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Message */}
              <View className="mb-7">
                <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-slate-400">
                  Mensaje
                </Text>
                <Controller
                  control={control}
                  name="message"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className={`rounded-2xl border px-4 pt-3 pb-2 ${errors.message ? "border-danger bg-danger/5" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                    >
                      <View className="flex-row gap-3">
                        <AlignLeft
                          size={16}
                          color={errors.message ? "#EF4444" : "#94A3B8"}
                          style={{ marginTop: 2 }}
                        />
                        <TextInput
                          className="flex-1 font-sans text-[14px] text-slate-900 dark:text-white leading-relaxed"
                          placeholder="Describí tu consulta o problema..."
                          placeholderTextColor="#94A3B8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          multiline
                          numberOfLines={5}
                          textAlignVertical="top"
                          style={{ minHeight: 110 }}
                          returnKeyType="default"
                          editable={!isPending}
                        />
                      </View>
                    </View>
                  )}
                />
                {errors.message && (
                  <Text className="mt-1 ml-1 text-[11px] font-sans-semi text-danger">
                    {errors.message.message}
                  </Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                className="items-center justify-center rounded-2xl bg-accent py-4 shadow-lg shadow-accent/30 active:scale-[0.98] active:bg-[#8C6D2E] disabled:opacity-60"
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-sans-bold uppercase tracking-[2px] text-white">
                    Enviar Mensaje
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
