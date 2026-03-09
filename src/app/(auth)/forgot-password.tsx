import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Scale } from 'lucide-react-native';
import { forgotPassword } from '@api/auth.api';
import { PageContainer } from '@components/ui';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            Toast.show({ type: 'error', text1: 'Ingresá tu email' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            Toast.show({ type: 'error', text1: 'Email inválido' });
            return;
        }

        try {
            setIsLoading(true);
            await forgotPassword(trimmed);
            setSent(true);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: 'Código enviado',
                text2: 'Revisá tu correo. Si no aparece, revisá la carpeta de spam.',
            });
        } catch {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo enviar el código. Intentá más tarde.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const goToReset = () => {
        router.replace(`/(auth)/reset-password?email=${encodeURIComponent(email.trim())}`);
    };

    return (
        <PageContainer keyboardAware={true} className="px-0">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-6 pt-12">
                <Pressable
                    onPress={() => router.back()}
                    className="mb-6 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 active:opacity-70"
                >
                    <ChevronLeft size={20} color="#64748B" />
                </Pressable>
            </View>

            <View className="px-6 pb-12 pt-4 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-primary shadow-premium dark:bg-white/5 dark:shadow-premium-dark mb-6">
                    <Scale size={32} color="#B89146" />
                </View>
                <Text className="text-2xl font-sans-bold text-center text-slate-900 dark:text-white">
                    Recuperar contraseña
                </Text>
                <Text className="text-sm font-sans text-center text-slate-500 dark:text-slate-400 mt-2 px-4">
                    Ingresá tu email y te enviamos un código de 6 dígitos.
                </Text>
            </View>

            <View className="px-6 flex-1">
                <View className="overflow-hidden rounded-[40px] bg-white p-8 shadow-premium dark:bg-primary dark:shadow-premium-dark border border-slate-100 dark:border-white/5">
                    {!sent ? (
                        <>
                            <View className="mb-6">
                                <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                    Email
                                </Text>
                                <TextInput
                                    className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    placeholder="ejemplo@estudio.com"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!isLoading}
                                />
                            </View>
                            <Pressable
                                className="items-center justify-center rounded-full bg-accent py-4 shadow-lg shadow-accent/40 active:scale-[0.98] disabled:opacity-50"
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-white">
                                    {isLoading ? 'Enviando...' : 'Enviar código'}
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Text className="text-sm font-sans text-slate-600 dark:text-slate-400 text-center mb-6">
                                Código enviado a {email.trim()}
                            </Text>
                            <Pressable
                                className="items-center justify-center rounded-full bg-accent py-4 shadow-lg shadow-accent/40 active:scale-[0.98]"
                                onPress={goToReset}
                            >
                                <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-white">
                                    Ingresar código
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>

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
