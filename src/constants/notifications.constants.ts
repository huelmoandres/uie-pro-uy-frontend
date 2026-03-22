import {
  FileSearch,
  FileText,
  Mic,
  Bell,
  PenLine,
  FolderClosed,
} from "lucide-react-native";
import type { INotificationPreferences } from "@app-types/notification-preferences.types";

/** Tipos de notificación push. Para agregar uno nuevo: añadir aquí y en el schema del backend. */
export const NOTIFICATION_TYPES: {
  key: keyof Omit<
    INotificationPreferences,
    "pushEnabled" | "emailWeeklyDigest" | "digestDay" | "pushNotificationMode" | "hasDeviceToken"
  >;
  icon: typeof FileSearch;
  title: string;
  description: string;
}[] = [
  {
    key: "expedienteUpdates",
    icon: FileSearch,
    title: "Movimientos judiciales",
    description:
      "Recibí una alerta cada vez que un expediente que seguís registre nuevos movimientos.",
  },
  {
    key: "notifyDecrees",
    icon: FileText,
    title: "Decretos",
    description:
      "Notificaciones específicas cuando se dicta un nuevo decreto en tus expedientes.",
  },
  {
    key: "notifyAudiences",
    icon: Mic,
    title: "Audiencias",
    description: "Alertas cuando se programa o modifica una audiencia.",
  },
  {
    key: "notifyNotifications",
    icon: Bell,
    title: "Notificaciones judiciales",
    description: "Alertas ante notificaciones formales dentro del expediente.",
  },
  {
    key: "notifyWritings",
    icon: PenLine,
    title: "Escritos",
    description: "Notificaciones al presentarse escritos o documentos.",
  },
  {
    key: "notifyInternal",
    icon: FolderClosed,
    title: "Trámites internos",
    description:
      "Incluir movimientos internos (Secretaría, Mesa de entrada). Activar solo si necesitás seguimiento detallado.",
  },
];

/** Opciones del selector de modo de agrupación de notificaciones push. */
export const PUSH_MODE_OPTIONS: {
  value: 'INDIVIDUAL' | 'GROUPED';
  label: string;
  description: string;
}[] = [
  {
    value: 'INDIVIDUAL',
    label: 'Una por expediente',
    description: 'Recibís una alerta separada por cada expediente con novedades. Se agrupan automáticamente en tu celular.',
  },
  {
    value: 'GROUPED',
    label: 'Resumen diario',
    description: 'Recibís una sola notificación con todos los expedientes que tuvieron movimientos.',
  },
];

/** Días de la semana para el resumen semanal (0=Dom, 1=Lun, ..., 6=Sáb). */
export const DIGEST_DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
] as const;
