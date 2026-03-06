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
import { Scale, ChevronLeft, Info } from 'lucide-react-native';
import { useRegisterMutation } from '@hooks/useAuthMutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@schemas/auth.schema';
import { PageContainer } from '@components/ui';

/**
 * Premium Register Screen
 * Consistent with LoginScreen aesthetics and Rule 12 (SM).
 */
export default function RegisterScreen() {
    const { mutateAsync: registerMutation, isPending: isLoading } = useRegisterMutation();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = data;
            await registerMutation(registerData);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
        } catch (error) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error de registro',
                text2: 'No se pudo crear la cuenta. Intentá con otro correo.',
            });
        }
    };

    return (
        <PageContainer keyboardAware={true} className="px-0">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="px-6 pt-12 pb-8 items-start">
                <Pressable
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-premium dark:bg-white/5 dark:border-white/10 dark:shadow-none active:scale-90"
                >
                    <ChevronLeft size={24} color="#B89146" />
                </Pressable>
                <View className="mt-8 flex-row items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary mr-4 shadow-lg shadow-primary/20">
                        <Scale size={20} color="#B89146" />
                    </View>
                    <View>
                        <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white">Crear Cuenta</Text>
                        <Text className="text-xs font-sans text-slate-500">Sumate a UIE Pro Uy</Text>
                    </View>
                </View>
            </View>

            {/* Form Card (Rule 12: SM) */}
            <View className="flex-1 px-2">
                <View className="overflow-hidden rounded-[40px] bg-white p-8 border border-slate-100 dark:bg-primary dark:border-white/5 shadow-premium dark:shadow-premium-dark">
                    <View>
                        <View className="mb-5">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Nombre Completo
                            </Text>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.name ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="Ej: Juan Pérez"
                                        placeholderTextColor="#94A3B8"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value || ''}
                                        autoCapitalize="words"
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.name && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.name.message}
                                </Text>
                            )}
                        </View>

                        <View className="mb-5">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Correo Electrónico
                            </Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.email ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="correo@ejemplo.com"
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

                        <View className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/10 flex-row items-center">
                            <Info size={16} color="#B89146" />
                            <Text className="ml-3 flex-1 text-[11px] font-sans text-slate-700 leading-relaxed">
                                Tu teléfono y cédula son fundamentales para <Text className="font-sans-bold text-accent">agendar hora</Text> de forma automática en el sistema judicial.
                            </Text>
                        </View>

                        <View className="mb-5">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                WhatsApp / Teléfono
                            </Text>
                            <Controller
                                control={control}
                                name="phone"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.phone ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="99123456"
                                        placeholderTextColor="#94A3B8"
                                        onBlur={onBlur}
                                        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                                        value={value || ''}
                                        keyboardType="phone-pad"
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.phone && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.phone.message}
                                </Text>
                            )}
                        </View>

                        <View className="mb-5">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Cédula de Identidad
                            </Text>
                            <Controller
                                control={control}
                                name="cedula"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.cedula ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
                                        placeholder="12345678"
                                        placeholderTextColor="#94A3B8"
                                        onBlur={onBlur}
                                        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                                        value={value || ''}
                                        keyboardType="number-pad"
                                        editable={!isLoading}
                                    />
                                )}
                            />
                            {errors.cedula && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.cedula.message}
                                </Text>
                            )}
                        </View>

                        <View className="mb-5">
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

                        <View className="mb-8">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
                                Confirmar Contraseña
                            </Text>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`rounded-2xl bg-slate-50 border ${errors.confirmPassword ? 'border-danger' : 'border-slate-200'} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
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
                            {errors.confirmPassword && (
                                <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
                                    {errors.confirmPassword.message}
                                </Text>
                            )}
                        </View>

                        <Pressable
                            className="items-center justify-center rounded-full bg-accent py-4 shadow-lg shadow-accent/40 active:scale-[0.98] active:bg-accent-dark disabled:opacity-50"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-white">
                                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View className="mt-10 flex-row justify-center pb-12 px-10">
                    <Text className="font-sans text-sm text-slate-600">¿Ya tenés cuenta? </Text>
                    <Pressable onPress={() => router.push('/(auth)/login')}>
                        <Text className="font-sans-bold text-sm text-accent-dark">Ingresá acá</Text>
                    </Pressable>
                </View>
            </View>
        </PageContainer>
    );
}
