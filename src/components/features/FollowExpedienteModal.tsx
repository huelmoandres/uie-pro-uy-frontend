import React, { useRef } from 'react';
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { PlusCircle, X, FileSearch } from 'lucide-react-native';
import { followExpedienteSchema, type FollowExpedienteFormData } from '@schemas/auth.schema';
import { ExpedienteService } from '@services';

interface FollowExpedienteModalProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Premium modal to follow a new expediente by IUE.
 * Uses react-hook-form + zod for robust validation per ai-rules.md.
 */
export const FollowExpedienteModal: React.FC<FollowExpedienteModalProps> = ({
    visible,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const inputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FollowExpedienteFormData>({
        resolver: zodResolver(followExpedienteSchema),
        defaultValues: { iue: '' },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async ({ iue }: FollowExpedienteFormData) => {
        // Convert user-facing slash format to colon for the API (avoids URL encoding issues)
        const apiIue = iue.replace('/', ':');

        try {
            await ExpedienteService.follow(apiIue);

            await queryClient.invalidateQueries({
                queryKey: ExpedienteService.queryKeys.lists(),
            });

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: 'Expediente agregado',
                text2: `${iue} fue agregado. Los datos se sincronizarán en breve.`,
            });

            handleClose();
        } catch (err: any) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const msg: string =
                err?.response?.data?.message ??
                'No se pudo agregar el expediente. Verificá el IUE ingresado.';

            // Set error inline instead of Toast to avoid Z-index issues with the Modal
            setError('iue', { type: 'manual', message: msg });
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={handleClose}
            onShow={() => setTimeout(() => inputRef.current?.focus(), 100)}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                    <View style={styles.backdropDim} />
                </Pressable>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="w-full"
                >
                    <View className="w-full overflow-hidden rounded-t-[36px] bg-white dark:bg-[#0B1120] border border-b-0 border-slate-100 dark:border-white/5 shadow-2xl pb-10 px-6 pt-6">
                        {/* Handle */}
                        <View className="items-center mb-6">
                            <View className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                        </View>

                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View className="flex-row items-center gap-3">
                                <View className="h-10 w-10 items-center justify-center rounded-[16px] bg-accent/10">
                                    <PlusCircle size={22} color="#B89146" />
                                </View>
                                <View>
                                    <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
                                        Nueva Suscripción
                                    </Text>
                                    <Text className="text-lg font-sans-bold text-slate-900 dark:text-white leading-tight">
                                        Seguir Expediente
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

                        {/* IUE Field */}
                        <View className="mb-2">
                            <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-slate-400">
                                Número de Expediente (IUE)
                            </Text>

                            <Controller
                                control={control}
                                name="iue"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className={`flex-row items-center rounded-2xl border px-4 ${errors.iue ? 'border-danger bg-danger/5' : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'}`}>
                                        <FileSearch size={18} color={errors.iue ? '#EF4444' : '#94A3B8'} />
                                        <TextInput
                                            ref={inputRef}
                                            className="flex-1 px-3 py-3.5 font-sans text-[15px] text-slate-900 dark:text-white"
                                            placeholder="Ej: 40-91/2018"
                                            placeholderTextColor="#94A3B8"
                                            value={value}
                                            onChangeText={(v) => {
                                                // Only allow digits, dashes and slashes
                                                onChange(v.replace(/[^0-9\-\/]/g, ''));
                                            }}
                                            onBlur={onBlur}
                                            autoCapitalize="none"
                                            keyboardType="numbers-and-punctuation"
                                            returnKeyType="done"
                                            onSubmitEditing={handleSubmit(onSubmit)}
                                            editable={!isSubmitting}
                                        />
                                    </View>
                                )}
                            />

                            {errors.iue && (
                                <Text className="mt-1.5 ml-1 text-[11px] font-sans-semi text-danger">
                                    {errors.iue.message}
                                </Text>
                            )}
                        </View>

                        <Text className="mb-8 ml-1 text-[11px] font-sans text-slate-400">
                            Formato:{' '}
                            <Text className="font-sans-semi text-slate-600 dark:text-slate-300">
                                40-91/2018
                            </Text>{' '}
                            (sede-número/año)
                        </Text>

                        {/* Submit */}
                        <Pressable
                            className="items-center justify-center rounded-2xl bg-accent py-4 shadow-lg shadow-accent/30 active:scale-[0.98] active:bg-[#8C6D2E] disabled:opacity-60"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text className="text-sm font-sans-bold uppercase tracking-[2px] text-white">
                                    Comenzar a Seguir
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropDim: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
});
