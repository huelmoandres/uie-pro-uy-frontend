import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { ChevronDown, ChevronUp, HelpCircle, MessageSquare } from 'lucide-react-native';
import { PageContainer } from '@components/ui';
import { ContactSupportModal } from '@components/features';

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
        question: '¿Puedo agregar expedientes nuevos si no soy el abogado patrocinante?',
        answer: 'Sí. Podés agregar cualquier expediente público usando el botón "+" en la parte inferior de la lista de Expedientes y escribiendo su IUE.',
    },
];

export default function SupportScreen() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [modalVisible, setModalVisible] = useState(false);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <PageContainer>
                <Stack.Screen options={{ title: 'Soporte y Ayuda' }} />

                {/* ── Banner ──────────────────────────────────────────────── */}
                <View className="p-4 pt-6">
                    <View className="rounded-[24px] bg-primary p-6 shadow-premium-dark relative overflow-hidden">
                        <View className="absolute -right-4 -top-4 opacity-10">
                            <HelpCircle size={100} color="#FFFFFF" />
                        </View>
                        <Text className="mb-1 text-lg font-sans-bold text-white">
                            ¿Necesitás ayuda?
                        </Text>
                        <Text className="text-[13px] font-sans text-slate-300 mb-5 leading-relaxed">
                            Nuestro equipo está disponible para ayudarte con cualquier consulta
                            sobre la plataforma.
                        </Text>
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            className="flex-row items-center self-start gap-2 rounded-full bg-accent px-5 py-3 active:bg-[#8C6D2E] active:scale-[0.97]"
                        >
                            <MessageSquare size={16} color="#FFFFFF" />
                            <Text className="text-sm font-sans-bold uppercase tracking-[1.5px] text-white">
                                Enviar mensaje
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* ── FAQ ─────────────────────────────────────────────────── */}
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
                                        <Text
                                            className={`flex-1 pr-4 font-sans-semi text-[14px] leading-tight ${isOpen ? 'text-accent' : 'text-slate-800 dark:text-slate-200'}`}
                                        >
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
            </PageContainer>

            <ContactSupportModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}
