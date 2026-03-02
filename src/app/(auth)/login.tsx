import React, { useState } from 'react';
import {
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { Scale } from 'lucide-react-native';
import { useAuth } from '@context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@schemas/auth.schema';
import { PageContainer } from '@components/ui';

/**
 * Premium Login Screen
 * Uses deep navy and refined gold palette for a professional look.
 * Follows Rule 12 (SM default).
 */
export default function LoginScreen() {
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await signIn(data);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
        } catch (error) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error de ingreso',
                text2: 'Credenciales inválidas o error de red.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer keyboardAware={true} className="px-0">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="px-6 pb-12 pt-12 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-primary shadow-premium dark:bg-white/5 dark:shadow-premium-dark mb-6">
                    <Scale size={32} color="#B89146" />
                </View>
                <Text className="text-3xl font-sans-bold text-center text-slate-900 dark:text-white tracking-tight">UIE Pro Uy</Text>
                <Text className="text-sm font-sans text-center text-slate-500 mt-2">Gestión Judicial de Alta Gama</Text>
            </View>

            {/* Form Card (Rule 12: SM) */}
            <View className="px-2 flex-1">
                <View className="overflow-hidden rounded-[40px] bg-white p-8 shadow-premium dark:bg-primary dark:shadow-premium-dark border border-slate-100 dark:border-white/5">
                    <View>
                        <View className="mb-6">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Email Profesional
                            </Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.email ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="ejemplo@estudio.com"
                                        placeholderTextColor="#94A3B8"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.email && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>

                        <View className="mb-8">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Contraseña
                            </Text>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.password ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.password && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.password.message}
                                </Text>
                            )}
                        </View>

                        <Pressable
                            className="items-center justify-center rounded-full bg-accent py-3 shadow-lg shadow-accent/40 active:scale-[0.98] active:bg-accent-dark disabled:opacity-50"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            <Text className="text-xs font-sans-bold uppercase tracking-[2px] text-white">
                                {isLoading ? 'Ingresando...' : 'INGRESAR'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View className="mt-10 flex-row justify-center pb-12">
                    <Text className="font-sans text-sm text-slate-400">¿No tenés cuenta? </Text>
                    <Pressable onPress={() => router.push('/(auth)/register')}>
                        <Text className="font-sans-bold text-sm text-accent">Registrate</Text>
                    </Pressable>
                </View>
            </View>
        </PageContainer>
    );
}
