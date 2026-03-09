import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Scale } from 'lucide-react-native';
import { resetPassword } from '@api/auth.api';
import { PageContainer } from '@components/ui';

export default function ResetPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>();
    const emailParam = typeof params.email === 'string' ? params.email : '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail) {
            Toast.show({ type: 'error', text1: 'Ingresá tu email' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Toast.show({ type: 'error', text1: 'Email inválido' });
            return;
        }
        if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
            Toast.show({ type: 'error', text1: 'El código debe tener 6 dígitos' });
            return;
        }
        if (newPassword.length < 8) {
            Toast.show({ type: 'error', text1: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Las contraseñas no coinciden' });
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(trimmedEmail, trimmedOtp, newPassword);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: 'Contraseña actualizada',
                text2: 'Ya podés iniciar sesión con tu nueva contraseña.',
            });
            router.replace('/(auth)/login');
        } catch (err: unknown) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            let msg: string | null = null;
            if (err && typeof err === 'object' && 'response' in err) {
                const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
                const m = data?.message;
                msg = Array.isArray(m) ? m[0] : (typeof m === 'string' ? m : null);
            }
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: msg ?? 'Código inválido o expirado. Solicitá uno nuevo.',
            });
        } finally {
            setIsLoading(false);
        }
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

            <View className="px-6 pb-8 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-primary shadow-premium dark:bg-white/5 dark:shadow-premium-dark mb-6">
                    <Scale size={32} color="#B89146" />
                </View>
                <Text className="text-2xl font-sans-bold text-center text-slate-900 dark:text-white">
                    Nueva contraseña
                </Text>
                <Text className="text-sm font-sans text-center text-slate-500 dark:text-slate-400 mt-2 px-4">
                    Ingresá el código recibido y tu nueva contraseña.
                </Text>
            </View>

            <View className="px-6 flex-1">
                <View className="overflow-hidden rounded-[40px] bg-white p-8 shadow-premium dark:bg-primary dark:shadow-premium-dark border border-slate-100 dark:border-white/5">
                    <View className="mb-4">
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

                    <View className="mb-4">
                        <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                            Código (6 dígitos)
                        </Text>
                        <TextInput
                            className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                            placeholder="123456"
                            placeholderTextColor="#94A3B8"
                            value={otp}
                            onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!isLoading}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                            Nueva contraseña
                        </Text>
                        <TextInput
                            className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor="#94A3B8"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <View className="mb-8">
                        <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                            Confirmar contraseña
                        </Text>
                        <TextInput
                            className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                            placeholder="Repetí la contraseña"
                            placeholderTextColor="#94A3B8"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <Pressable
                        className="items-center justify-center rounded-full bg-accent py-4 shadow-lg shadow-accent/40 active:scale-[0.98] disabled:opacity-50"
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-white">
                            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Text>
                    </Pressable>
                </View>

                <View className="mt-8 flex-row justify-center">
                    <Pressable onPress={() => router.replace('/(auth)/forgot-password')}>
                        <Text className="font-sans text-sm text-slate-500 dark:text-slate-400">
                            ¿No recibiste el código? Volver a solicitar
                        </Text>
                    </Pressable>
                </View>
            </View>
        </PageContainer>
    );
}
