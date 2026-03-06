import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ShieldAlert, Lock, EyeOff, Server, FileText } from 'lucide-react-native';

interface PolicySectionProps {
    title: string;
    description: string;
    icon: React.ElementType;
}

const PolicySection: React.FC<PolicySectionProps> = ({ title, description, icon: Icon }) => (
    <View className="mb-6">
        <View className="flex-row items-center mb-3">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent/10 mr-3">
                <Icon size={16} color="#B89146" />
            </View>
            <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white flex-1">{title}</Text>
        </View>
        <Text className="text-sm font-sans leading-relaxed text-slate-600 dark:text-slate-400 pl-11">
            {description}
        </Text>
    </View>
);

export default function PrivacyScreen() {
    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ title: 'Privacidad' }} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center mb-8 px-4">
                    <View className="h-20 w-20 rounded-[28px] bg-primary items-center justify-center shadow-premium-dark border border-white/10 mb-5 relative">
                        <View className="absolute inset-0 items-center justify-center opacity-10">
                            <ShieldAlert size={60} color="#FFFFFF" />
                        </View>
                        <Lock size={32} color="#B89146" />
                    </View>
                    <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white text-center mb-2">
                        Política de Privacidad
                    </Text>
                    <Text className="text-sm font-sans text-slate-500 text-center leading-relaxed">
                        Tu privacidad y la seguridad de tus datos son nuestra máxima prioridad. Conocé cómo protegemos tu información.
                    </Text>
                </View>

                <View className="bg-white dark:bg-primary/50 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-premium dark:shadow-premium-dark">

                    <PolicySection
                        icon={EyeOff}
                        title="1. Uso de la Información"
                        description="Los expedientes (IUEs) que seguís mediante nuestra plataforma se almacenan de manera segura para poder notificarte de nuevos movimientos de forma automatizada. No compartimos, vendemos, ni alquilamos tu información a terceros."
                    />

                    <View className="h-[1px] bg-slate-100 dark:bg-white/5 mb-6 ml-11" />

                    <PolicySection
                        icon={Server}
                        title="2. Sincronización con Rincón Judicial"
                        description="Actuamos como un canal en tiempo real. Consultamos los servicios públicos del Poder Judicial (SOAP) bajo demanda y almacenamos los metadatos relevantes únicamente para optimizar la velocidad de la app y tu experiencia de lectura."
                    />

                    <View className="h-[1px] bg-slate-100 dark:bg-white/5 mb-6 ml-11" />

                    <PolicySection
                        icon={Lock}
                        title="3. Seguridad de tus Credenciales"
                        description="Tus credenciales de acceso se almacenan localmente en tu dispositivo bajo canales encriptados (Secure Store) y utilizamos tokens temporales para comunicarnos con el servidor central, minimizando posibles riesgos de intercepción."
                    />

                    <View className="h-[1px] bg-slate-100 dark:bg-white/5 mb-6 ml-11" />

                    <PolicySection
                        icon={FileText}
                        title="4. Tus Derechos"
                        description="En cualquier momento podés darte de baja del sistema o dejar de seguir expedientes (Unfollow). Al hacerlo, se cortará inmediatamente la comunicación asociada a los mismos desde tu cuenta."
                    />

                </View>

                <Text className="mt-8 text-center text-[11px] font-sans text-slate-400">
                    Última actualización: Marzo 2026
                </Text>
            </ScrollView>
        </View>
    );
}
