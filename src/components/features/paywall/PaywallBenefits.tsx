import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const PREVIEW_COUNT = 3;

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

function BenefitItem({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  compact: boolean;
}) {
  return (
    <View
      className={`flex-row gap-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-primary/40 ${
        compact ? "items-center p-3" : "items-start p-4"
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
        <Icon size={20} color="#B89146" />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Check size={14} color="#15803D" />
          <Text className="text-sm font-sans-bold text-slate-900 dark:text-white">
            {title}
          </Text>
        </View>
        {!compact && (
          <Text className="mt-1.5 text-[12px] font-sans text-slate-500 dark:text-slate-400">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

export function PaywallBenefits() {
  const [expanded, setExpanded] = useState(false);
  const preview = BENEFITS.slice(0, PREVIEW_COUNT);

  return (
    <View className="mb-8 gap-4">
      {expanded ? (
        <>
          {BENEFITS.map((b, i) => (
            <BenefitItem
              key={i}
              icon={b.icon}
              title={b.title}
              description={b.description}
              compact={false}
            />
          ))}
          <Pressable
            className="flex-row items-center justify-center gap-2 py-2 active:opacity-70"
            onPress={() => setExpanded(false)}
          >
            <ChevronUp size={18} color="#64748B" />
            <Text className="text-[13px] font-sans-semi text-slate-500 dark:text-slate-400">
              Ver menos
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          {preview.map((b, i) => (
            <BenefitItem
              key={i}
              icon={b.icon}
              title={b.title}
              description={b.description}
              compact
            />
          ))}
          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/5 py-3.5 active:opacity-70"
            onPress={() => setExpanded(true)}
          >
            <Text className="text-[13px] font-sans-semi text-accent">
              Ver todos los beneficios
            </Text>
            <ChevronDown size={18} color="#B89146" />
          </Pressable>
        </>
      )}
    </View>
  );
}
