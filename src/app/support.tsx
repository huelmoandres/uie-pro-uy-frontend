import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ChevronDown, ChevronUp, Mail, ExternalLink, HelpCircle } from 'lucide-react-native';

interface FaqItem {
    question: string;
    answer: string;
}

const FAQS: FaqItem[] = [
    {
        question: '¿Cómo sincronizo un expediente?',
        answer: 'Para sincronizar un expediente manualmente, andá a la vista de detalles del expediente y presioná el botón "Sincronizar" en la esquina superior derecha o utilizá la acción flotante. El sistema consultará al Poder Judicial para traerte los últimos movimientos.',
    },
    {
        question: '¿Cada cuánto se actualizan los expedientes?',
        answer: 'Los expedientes se sincronizan de forma automática periódicamente en segundo plano. Sin embargo, en la lista principal podés ver hace cuánto fue la última sincronización en la esquina superior derecha de cada tarjeta.',
    },
    {
        question: 'El decreto aparece vacío, ¿qué hago?',
        answer: 'Es normal. Algunos tribunales aún no digitalizan el contenido completo del decreto o solo suben el título "Mero Trámite". Si tocás el evento para ver el decreto y dice "El texto no está disponible", significa que no fue cargado en el sistema original.',
    },
    {
        question: '¿Puedo agregar expdientes nuevos si no soy el abogado patrocinante?',
        answer: 'Sí. Podés agregar cualquier expediente público usando el botón "+" en la parte inferior de la lista de Expedientes y escribiendo su IUE.',
    }
];

export default function SupportScreen() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:soporte@judicialconnector.com.uy?subject=Consulta%20desde%20la%20App');
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ title: 'Soporte y Ayuda', headerBackTitle: '' }} />
            <ScrollView className="flex-1">

                {/* Contact Banner */}
                <View className="p-4 pt-6">
                    <View className="rounded-[24px] bg-primary p-5 shadow-premium-dark relative overflow-hidden">
                        <View className="absolute -right-4 -top-4 opacity-10">
                            <HelpCircle size={100} color="#FFFFFF" />
                        </View>
                        <Text className="mb-1 text-lg font-sans-bold text-white">¿Necesitás ayuda?</Text>
                        <Text className="mb-4 text-[13px] font-sans text-slate-300">
                            Estamos acá para asistirte. Escribinos directamente y te responderemos a la brevedad.
                        </Text>
                        <Pressable
                            onPress={handleEmailSupport}
                            className="flex-row items-center self-start rounded-xl bg-accent px-4 py-2.5 active:scale-[0.98] active:bg-[#8C6D2E]"
                        >
                            <Mail size={16} color="#FFFFFF" />
                            <Text className="font-sans-bold text-white text-[13px] ml-2">Enviar Mensaje</Text>
                        </Pressable>
                    </View>
                </View>

                {/* FAQ Section */}
                <View className="p-4">
                    <Text className="ml-2 mb-3 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
                        Preguntas Frecuentes
                    </Text>
                    <View className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
                        {FAQS.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <View
                                    key={index}
                                    className={`${index !== FAQS.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}
                                >
                                    <Pressable
                                        onPress={() => toggleAccordion(index)}
                                        className="flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5"
                                    >
                                        <Text className={`flex-1 pr-4 font-sans-semi text-[14px] leading-tight ${isOpen ? 'text-accent' : 'text-slate-800 dark:text-slate-200'
                                            }`}>
                                            {faq.question}
                                        </Text>
                                        {isOpen ? (
                                            <ChevronUp size={18} color="#B89146" />
                                        ) : (
                                            <ChevronDown size={18} color="#94A3B8" />
                                        )}
                                    </Pressable>
                                    {isOpen && (
                                        <View className="px-4 pb-4 pt-1">
                                            <Text className="font-sans text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                {faq.answer}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
