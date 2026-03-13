import React from "react";
import { View, Text } from "react-native";
import {
  FileText,
  Bell,
  AlarmClock,
  Calculator,
  Check,
  Star,
  FileDown,
  LayoutDashboard,
  CalendarClock,
  StickyNote,
  MapPin,
  Map,
  Mail,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const BENEFITS: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: FileText,
    title: "Seguimiento de expedientes",
    description: "Seguí todos tus expedientes judiciales en un solo lugar.",
  },
  {
    icon: Bell,
    title: "Notificaciones push de decretos",
    description: "Recibí alertas en tiempo real cuando hay nuevos movimientos.",
  },
  {
    icon: Mail,
    title: "Resumen semanal por email",
    description:
      "Recibí cada semana un correo con plazos, actividad reciente y expedientes inactivos. Elegí el día de envío.",
  },
  {
    icon: AlarmClock,
    title: "Recordatorios personalizados",
    description:
      "Recordatorios para plazos (X días antes) o para cualquier expediente con fecha y hora a elección.",
  },
  {
    icon: Calculator,
    title: "Calculadora de plazos",
    description:
      "Plazos procesales detectados automáticamente en tus decretos.",
  },
  {
    icon: MapPin,
    title: "Sedes judiciales",
    description:
      "Directorio de sedes del Poder Judicial. Buscá por nombre, filtrá por departamento, ciudad o materia.",
  },
  {
    icon: Map,
    title: "Abrir sedes en mapas",
    description:
      "Abrí cualquier sede en Google Maps o Waze para ver ubicación y navegar.",
  },
  {
    icon: Star,
    title: "Favoritos",
    description:
      "Marcá expedientes como favoritos para acceder rápido a los más importantes.",
  },
  {
    icon: FileDown,
    title: "Exportar a PDF",
    description: "Exportá expedientes completos o decretos individuales a PDF.",
  },
  {
    icon: CalendarClock,
    title: "Agenda procesal",
    description:
      "Plazos organizados por vencimiento y agendá turnos directamente.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Vista general con estadísticas, etapas procesales y actividad reciente.",
  },
  {
    icon: StickyNote,
    title: "Notas en expedientes",
    description: "Agregá notas privadas a cada expediente para tu seguimiento.",
  },
];

export function PaywallBenefits() {
  return (
    <View className="mb-8 gap-4">
      {BENEFITS.map((b, i) => (
        <View
          key={i}
          className="flex-row items-start gap-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-primary/40 p-4"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
            <b.icon size={20} color="#B89146" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Check size={14} color="#15803D" />
              <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
                {b.title}
              </Text>
            </View>
            <Text className="text-[12px] font-sans text-slate-500 dark:text-slate-400">
              {b.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
