import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAppColorScheme } from '@hooks/useAppColorScheme';
import { Monitor, Moon, Sun, Check, User as UserIcon, Phone, CreditCard, Save, X, Tag, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileFormData } from '@schemas/auth.schema';
import { updateProfile } from '@api/auth.api';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { ManageTagsModal } from '@components/features';
import { InfoButton } from '@components/ui';
import { INFO_HINTS } from '@constants/InfoHints';

export default function SettingsScreen() {
    const { user, updateUserState } = useAuth();
    const { colorScheme, setColorScheme } = useAppColorScheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [manageTagsVisible, setManageTagsVisible] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            cedula: user?.cedula || '',
        },
    });

    const onEditPress = () => {
        reset({
            name: user?.name || '',
            phone: user?.phone || '',
            cedula: user?.cedula || '',
        });
        setIsEditing(true);
    };

    const onSubmit = async (data: UpdateProfileFormData) => {
        setIsSaving(true);
        try {
            const updatedUser = await updateProfile(data);
            updateUserState(updatedUser);
            setIsEditing(false);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: 'Perfil actualizado',
                text2: 'Tus datos se guardaron correctamente.',
            });
        } catch (error) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo actualizar el perfil.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const options = [
        { label: 'Claro', value: 'light', icon: Sun },
        { label: 'Oscuro', value: 'dark', icon: Moon },
        { label: 'Sistema', value: 'system', icon: Monitor },
    ] as const;

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ title: 'Configuración' }} />
            <ScrollView className="flex-1">
                <View className="p-4 pt-6">
                    {/* User Profile Section */}
                    <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                        Mi Perfil
                    </Text>
                    <View className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-premium dark:bg-slate-900/50 dark:border-white/5 p-5 mb-8">
                        {!isEditing ? (
                            <>
                                <View className="flex-row items-center mb-6">
                                    <View className="h-14 w-14 rounded-2xl bg-slate-50 items-center justify-center dark:bg-white/5">
                                        <UserIcon size={28} color="#B89146" />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="text-lg font-sans-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                            {user?.name || 'Usuario'}
                                        </Text>
                                        <Text className="text-xs font-sans text-slate-400" numberOfLines={1}>
                                            {user?.email}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={onEditPress}
                                        className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 active:scale-95"
                                    >
                                        <Text className="text-xs font-sans-bold text-accent">EDITAR</Text>
                                    </Pressable>
                                </View>

                                <View className="space-y-4">
                                    <View className="flex-row items-center">
                                        <View className="h-8 w-8 rounded-lg bg-emerald-50 items-center justify-center dark:bg-emerald-500/10 mr-3">
                                            <Phone size={14} color="#10B981" />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-sans text-slate-400 uppercase tracking-tighter">Teléfono</Text>
                                            <Text className="text-sm font-sans-semi text-slate-700 dark:text-slate-300">
                                                {user?.phone || 'No especificado'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mt-4">
                                        <View className="h-8 w-8 rounded-lg bg-blue-50 items-center justify-center dark:bg-blue-500/10 mr-3">
                                            <CreditCard size={14} color="#3B82F6" />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-sans text-slate-400 uppercase tracking-tighter">Cédula</Text>
                                            <Text className="text-sm font-sans-semi text-slate-700 dark:text-slate-300">
                                                {user?.cedula || 'No especificado'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View>
                                <View className="flex-row items-center justify-between mb-6">
                                    <Text className="text-base font-sans-bold text-slate-900 dark:text-white">Editar Información</Text>
                                    <Pressable onPress={() => setIsEditing(false)} className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5">
                                        <X size={16} color="#64748B" />
                                    </Pressable>
                                </View>

                                <View className="space-y-4">
                                    <View>
                                        <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">Nombre</Text>
                                        <Controller
                                            control={control}
                                            name="name"
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    className={`rounded-xl bg-slate-50 border ${errors.name ? 'border-danger' : 'border-slate-100'} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    editable={!isSaving}
                                                />
                                            )}
                                        />
                                    </View>

                                    <View className="mt-4">
                                        <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">Teléfono</Text>
                                        <Controller
                                            control={control}
                                            name="phone"
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    className={`rounded-xl bg-slate-50 border ${errors.phone ? 'border-danger' : 'border-slate-100'} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                                                    onBlur={onBlur}
                                                    onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                                                    value={value || ''}
                                                    keyboardType="phone-pad"
                                                    editable={!isSaving}
                                                />
                                            )}
                                        />
                                    </View>

                                    <View className="mt-4">
                                        <Text className="mb-1.5 ml-1 text-[10px] font-sans-bold uppercase tracking-wider text-slate-400">Cédula</Text>
                                        <Controller
                                            control={control}
                                            name="cedula"
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    className={`rounded-xl bg-slate-50 border ${errors.cedula ? 'border-danger' : 'border-slate-100'} px-4 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white`}
                                                    onBlur={onBlur}
                                                    onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                                                    value={value || ''}
                                                    keyboardType="number-pad"
                                                    editable={!isSaving}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>

                                <Pressable
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={isSaving}
                                    className="mt-8 flex-row items-center justify-center rounded-2xl bg-accent py-3.5 shadow-lg shadow-accent/30 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Save size={16} color="white" className="mr-2" />
                                            <Text className="text-xs font-sans-bold uppercase tracking-widest text-white ml-2">GUARDAR CAMBIOS</Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Mis Etiquetas section */}
                    <View className="flex-row items-center ml-2 mb-2 mt-4">
                        <Text className="flex-1 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                            Mis Etiquetas
                        </Text>
                        <InfoButton
                            title={INFO_HINTS.etiquetas.title}
                            description={INFO_HINTS.etiquetas.description}
                        />
                    </View>
                    <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5 mb-8">
                        <Pressable
                            onPress={() => {
                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setManageTagsVisible(true);
                            }}
                            className="flex-row items-center p-4 active:bg-slate-50 dark:active:bg-white/5"
                        >
                            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                <Tag size={16} color="#B89146" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[15px] font-sans-semi text-slate-700 dark:text-slate-300">
                                    Gestionar etiquetas
                                </Text>
                                <Text className="text-[11px] font-sans text-slate-400 mt-0.5">
                                    Crear, editar y eliminar tus etiquetas de color
                                </Text>
                            </View>
                            <ChevronRight size={16} color="#CBD5E1" />
                        </Pressable>
                    </View>


                    <Text className="ml-2 mb-2 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                        Apariencia
                    </Text>
                    <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
                        {options.map((option, index) => {
                            const Icon = option.icon;
                            const isSelected = colorScheme === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => void setColorScheme(option.value)}
                                    className={`flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 ${index !== options.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''
                                        }`}
                                >
                                    <View className="flex-row items-center">
                                        <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5">
                                            <Icon size={16} color={isSelected ? '#B89146' : '#64748B'} />
                                        </View>
                                        <Text className={`font-sans-semi text-[15px] ${isSelected ? 'text-accent' : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {option.label}
                                        </Text>
                                    </View>
                                    {isSelected && <Check size={18} color="#B89146" />}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <ManageTagsModal
                visible={manageTagsVisible}
                onClose={() => setManageTagsVisible(false)}
            />
        </View>
    );
}
