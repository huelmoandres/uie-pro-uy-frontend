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
    // ── Expedientes ──────────────────────────────────────────────────────
    {
        question: '¿Cómo sincronizo un expediente?',
        answer: 'Andá al detalle del expediente y presioná el botón "Sincronizar" (ícono de recarga). El sistema consultará al Poder Judicial y traerá los últimos movimientos y decretos.',
    },
    {
        question: '¿Cada cuánto se actualizan los expedientes automáticamente?',
        answer: 'Los expedientes se sincronizan en segundo plano de forma periódica. En cada tarjeta podés ver hace cuánto fue la última sincronización. También podés forzar una actualización manual desde el detalle.',
    },
    {
        question: '¿Puedo agregar expedientes aunque no sea el abogado patrocinante?',
        answer: 'Sí. Podés seguir cualquier expediente público ingresando su IUE con el botón "+" en la lista principal. No se requiere ser parte del proceso.',
    },
    {
        question: '¿Cómo marco un expediente como favorito?',
        answer: 'En la lista de expedientes, presioná el ícono de estrella (★) en la tarjeta. Los expedientes marcados como favoritos aparecen primero en tu lista.',
    },
    {
        question: '¿Cómo agrego notas personales a un expediente?',
        answer: 'Ingresá al detalle del expediente, bajá hasta la sección "Mis Notas" y presioná "Agregar" o tocá el área de texto. Las notas se guardan automáticamente en tu cuenta y son visibles solo para vos.',
    },
    // ── Decretos e IA ────────────────────────────────────────────────────
    {
        question: 'El decreto aparece vacío, ¿qué hago?',
        answer: 'Es normal en algunos juzgados que aún no digitalizan el texto completo. Si aparece "Sin texto disponible", significa que el Poder Judicial no subió el contenido al sistema original — no es un error de la app.',
    },
    {
        question: '¿Cómo funciona el resumen con IA?',
        answer: 'Dentro del visor de un decreto, presioná "Resumir con IA". La app envía el texto al motor de inteligencia artificial que analiza el contenido y extrae un resumen ejecutivo, puntos clave y si requiere acción. El resultado se guarda para no re-procesar el mismo decreto.',
    },
    {
        question: '¿El resumen con IA es confiable?',
        answer: 'El resumen es orientativo y puede contener imprecisiones. Siempre revisá el texto original del decreto antes de tomar decisiones procesales. La IA es una herramienta de asistencia, no reemplaza el criterio profesional.',
    },
    // ── Agenda Procesal ──────────────────────────────────────────────────
    {
        question: '¿Qué es la Agenda Procesal?',
        answer: 'La Agenda Procesal detecta automáticamente plazos legales dentro de los decretos de tus expedientes (por ejemplo, "plazo de 10 días hábiles"). Los organiza en secciones: Vencen hoy, Esta semana, Este mes, Más adelante y Vencidos.',
    },
    {
        question: '¿Los plazos de la Agenda Procesal se crean solos?',
        answer: 'Sí. Cada vez que se sincronizan nuevos movimientos con decretos, el sistema analiza el texto y extrae los plazos detectados automáticamente. También podés entrar a la Agenda Procesal para verlos actualizados.',
    },
    {
        question: '¿Por qué algunos plazos ya aparecen vencidos?',
        answer: 'Si la fecha de vencimiento ya pasó, el plazo se clasifica automáticamente como "Vencido". Esto puede ocurrir en expedientes importados que tenían decretos con plazos históricos.',
    },
    // ── Notificaciones ───────────────────────────────────────────────────
    {
        question: '¿Cómo activo las notificaciones push?',
        answer: 'La primera vez que iniciás sesión, la app te pedirá permiso para enviar notificaciones. Si lo rechazaste, podés activarlas desde Configuración → Notificaciones de tu dispositivo, buscando IUE Pro.',
    },
    {
        question: '¿Qué tipo de notificaciones recibo?',
        answer: 'Recibís alertas cuando hay nuevos movimientos en los expedientes que seguís, y recordatorios de plazos procesales próximos a vencer. Podés configurar qué tipo de alertas querés recibir desde Mi Perfil → Notificaciones.',
    },
    {
        question: 'Recibo notificaciones pero llegan a deshora, ¿es normal?',
        answer: 'Las notificaciones se envían a las 8 a.m. y 8 p.m. (hora Uruguay). Si llegaran en horarios diferentes podría ser por un retraso en el servicio de mensajería push. Si persiste, contactanos.',
    },
    // ── Exportación PDF ──────────────────────────────────────────────────
    {
        question: '¿Puedo exportar un expediente a PDF?',
        answer: 'Sí. En el detalle del expediente, bajá hasta la sección "Gestión del Expediente" y presioná "Exportar PDF". Se generará un documento con carátula, metadatos, partes, estadísticas e historial de movimientos. El archivo se nombra automáticamente con el número de IUE.',
    },
    // ── Dashboard ────────────────────────────────────────────────────────
    {
        question: '¿Qué muestra el Dashboard?',
        answer: 'El Dashboard ofrece una vista general de todos tus expedientes: total de movimientos, etapas procesales detectadas, actividad reciente y estadísticas agregadas. Accedé desde el ícono de gráfico en la barra inferior.',
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
            <PageContainer scrollable>
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
