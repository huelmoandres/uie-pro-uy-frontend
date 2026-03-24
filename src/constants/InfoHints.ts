/**
 * Textos informativos para ayudar al usuario a entender cada sección.
 * Se muestran al presionar el ícono de información.
 */

export const INFO_HINTS = {
  // ── Dashboard ─────────────────────────────────────────────────────────
  stats: {
    title: "Resumen del dashboard",
    description:
      "Estas tarjetas muestran el total de expedientes que seguís, cuántos tuvieron actividad en los últimos 30 días, y cuántos plazos procesales tenés abiertos o urgentes (≤7 días).",
  },
  urgentDeadlines: {
    title: "Plazos urgentes",
    description:
      "Plazos que vencen en ≤5 días. Detectados automáticamente en los decretos de tus expedientes. Tocá uno para ir al detalle del expediente.",
  },
  warningDeadlines: {
    title: "Plazos próximos",
    description:
      "Plazos que vencen en 6 a 15 días. Te ayudan a planificar con anticipación antes de que se vuelvan urgentes.",
  },
  recentMovements: {
    title: "Movimientos recientes",
    description:
      "Decretos y audiencias de alta prioridad de los últimos días. Incluye resoluciones importantes que requieren tu atención.",
  },
  dormantExpedientes: {
    title: "Expedientes inactivos",
    description:
      "Expedientes sin actividad hace más de 60 días. Podrían estar cerrados o en espera. Tocá uno para revisar el detalle.",
  },
  stageDistribution: {
    title: "Distribución por etapa",
    description:
      "Muestra cuántos expedientes están en cada etapa procesal del CGP (Inicio, Audiencia Preliminar, Etapa Probatoria, Alegatos, Sentencia, Recurso, Ejecución). Se calcula automáticamente según los movimientos de cada expediente.",
  },

  // ── Expedientes ────────────────────────────────────────────────────────
  expedientesList: {
    title: "Lista de expedientes",
    description:
      "Todos los expedientes que seguís. Usá el buscador para filtrar por IUE o carátula. El botón + agrega nuevos expedientes. La estrella marca favoritos.\n\nPara reserva múltiple: mantené presionado un expediente para activar el modo selección, elegí hasta 5 y tocá Agendar.",
  },
  todosFavoritos: {
    title: "Todos / Favoritos",
    description:
      "Todos: todos los expedientes. Favoritos: solo los que marcaste con la estrella. Los favoritos aparecen primero en la lista.",
  },

  // ── Sedes Judiciales ────────────────────────────────────────────────────
  sedes: {
    title: "Sedes Judiciales",
    description:
      "Directorio de sedes del Poder Judicial de Uruguay. Buscá por nombre o dirección, filtrá por departamento, ciudad o materia. Tocá una sede para ver su dirección, teléfono y horarios de atención.",
  },

  // ── Recordatorios ───────────────────────────────────────────────────────
  recordatorios: {
    title: "Recordatorios",
    description:
      'Podés crear recordatorios de dos formas:\n\n• Desde la Agenda: tocá la campana en un plazo abierto para recibir una notificación X días antes del vencimiento.\n\n• Desde cualquier expediente: tocá "Agregar recordatorio" en el detalle o la campana en la lista. Elegí fecha, hora, título y descripción personalizados.\n\nPara ver y eliminar recordatorios: en esta misma pantalla (Agenda), arriba aparece "Recordatorios programados". Tocá el ícono de papelera en cada uno para darlo de baja.',
  },

  // ── Agenda Procesal ────────────────────────────────────────────────────
  agendaProcesal: {
    title: "Agenda Procesal",
    description:
      "Plazos detectados automáticamente en los decretos de tus expedientes. Se organizan por urgencia: Vencen hoy, Esta semana, Este mes, Más adelante y Vencidos.",
  },
  /** Hint unificado para la pantalla Agenda (tabs Recordatorios + Plazos) */
  agendaScreen: {
    title: "Agenda Procesal",
    description:
      "Recordatorios: Tus notificaciones programadas. Creálos desde la campana en un plazo abierto o desde cualquier expediente (fecha y hora personalizadas). Tocá la papelera para eliminar.\n\nPlazos: Detectados automáticamente en los decretos. Se organizan por urgencia: Vencen hoy, Esta semana, Este mes, Más adelante y Vencidos.",
  },
  agendaVencenHoy: {
    title: "Vencen hoy",
    description:
      "Plazos que vencen en el día de hoy. Requieren atención inmediata.",
  },
  agendaEstaSemana: {
    title: "Esta semana",
    description: "Plazos que vencen en los próximos 7 días.",
  },
  agendaEsteMes: {
    title: "Este mes",
    description: "Plazos que vencen en los próximos 30 días.",
  },
  agendaMasAdelante: {
    title: "Más adelante",
    description: "Plazos que vencen en más de 30 días.",
  },
  agendaVencidos: {
    title: "Vencidos",
    description: "Plazos cuya fecha de vencimiento ya pasó.",
  },

  // ── Detalle Expediente ─────────────────────────────────────────────────
  agendaTab: {
    title: "Agenda Procesal",
    description:
      "Plazos detectados en los decretos de este expediente. Tocá para ver el decreto completo.",
  },
  timeline: {
    title: "Línea de tiempo",
    description:
      "Historial de movimientos del expediente. Incluye decretos, notificaciones, audiencias y escritos.",
  },
  misNotas: {
    title: "Mis notas",
    description:
      "Notas personales que solo vos ves. Útiles para recordar ideas, estrategias o pendientes del expediente.",
  },
  resumenIA: {
    title: "Resumen con IA",
    description:
      "La IA analiza el texto del decreto y genera un resumen ejecutivo. Es orientativo; siempre revisá el texto original antes de tomar decisiones.",
  },

  // ── Mi Perfil ─────────────────────────────────────────────────────────
  perfilInfo: {
    title: "Datos del perfil",
    description:
      "Tu nombre y correo se usan al realizar reservas en la Agenda Procesal del Poder Judicial. Mantener estos datos actualizados ayuda a que las reservas se procesen correctamente.",
  },

  // ── Etiquetas Personalizadas ──────────────────────────────────────────
  etiquetas: {
    title: "¿Para qué sirven las etiquetas?",
    description:
      'Las etiquetas son marcas de colores que vos mismo creás para organizar tus expedientes. Por ejemplo: "Urgente", "Familia", "Laboral" o "Pendiente de cobro".\n\nSolo vos las ves. Podés crear hasta 20 etiquetas y asignar varias a un mismo expediente.',
  },
  etiquetasGestion: {
    title: "Cómo gestionar etiquetas",
    description:
      "Desde Configuración → Mis Etiquetas podés:\n• Crear nuevas etiquetas con nombre y color\n• Editar el nombre o color de las existentes\n• Eliminar una etiqueta (se quita automáticamente de todos tus expedientes)\n\nPara asignar una etiqueta a un expediente, tocá el ícono 🏷️ en la tarjeta del expediente.",
  },
  etiquetasLimite: {
    title: "Límite de etiquetas",
    description:
      "Podés crear hasta 20 etiquetas. Si llegás al límite, eliminá alguna que ya no uses antes de crear una nueva.",
  },
} as const;
