/**
 * Preguntas frecuentes para la pantalla de Soporte.
 * Organizadas por categoría para facilitar mantenimiento.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  // ── Expedientes ──────────────────────────────────────────────────────
  {
    question: "¿Cómo sincronizo un expediente?",
    answer:
      'Andá al detalle del expediente y presioná el botón "Sincronizar" (ícono de recarga). El sistema consultará al Poder Judicial y traerá los últimos movimientos y decretos.',
  },
  {
    question: "¿Cada cuánto se actualizan los expedientes automáticamente?",
    answer:
      "Los expedientes se sincronizan en segundo plano de forma periódica. En cada tarjeta podés ver hace cuánto fue la última sincronización. También podés forzar una actualización manual desde el detalle.",
  },
  {
    question:
      "¿Puedo agregar expedientes aunque no sea el abogado patrocinante?",
    answer:
      'Sí. Podés seguir cualquier expediente público ingresando su IUE con el botón "+" en la lista principal. No se requiere ser parte del proceso.',
  },
  {
    question: "¿Cómo marco un expediente como favorito?",
    answer:
      "En la lista de expedientes, presioná el ícono de estrella (★) en la tarjeta. Los expedientes marcados como favoritos aparecen primero en tu lista.",
  },
  {
    question: "¿Cómo agrego notas personales a un expediente?",
    answer:
      'Ingresá al detalle del expediente, bajá hasta la sección "Mis Notas" y presioná "Agregar" o tocá el área de texto. Las notas se guardan automáticamente en tu cuenta y son visibles solo para vos.',
  },
  // ── Decretos e IA ────────────────────────────────────────────────────
  {
    question: "El decreto aparece vacío, ¿qué hago?",
    answer:
      'Es normal en algunos juzgados que aún no digitalizan el texto completo. Si aparece "Sin texto disponible", significa que el Poder Judicial no subió el contenido al sistema original — no es un error de la app.',
  },
  {
    question: "¿Cómo funciona el resumen con IA?",
    answer:
      'Dentro del visor de un decreto, presioná "Resumir con IA". La app envía el texto al motor de inteligencia artificial que analiza el contenido y extrae un resumen ejecutivo, puntos clave y si requiere acción. El resultado se guarda para no re-procesar el mismo decreto.',
  },
  {
    question: "¿El resumen con IA es confiable?",
    answer:
      "El resumen es orientativo y puede contener imprecisiones. Siempre revisá el texto original del decreto antes de tomar decisiones procesales. La IA es una herramienta de asistencia, no reemplaza el criterio profesional.",
  },
  // ── Sedes Judiciales ──────────────────────────────────────────────────
  {
    question: "¿Qué es la sección Sedes Judiciales?",
    answer:
      "Es un directorio de sedes del Poder Judicial de Uruguay. Podés buscar por nombre o dirección, filtrar por departamento, ciudad o materia, y ver datos de contacto, horarios y ubicación de cada sede.",
  },
  {
    question: "¿Cómo busco una sede específica?",
    answer:
      'Usá el buscador para escribir nombre o dirección. También podés aplicar filtros tocando el ícono de filtros: elegí departamento, ciudad y/o materia. Los resultados se actualizan automáticamente.',
  },
  // ── Recordatorios ────────────────────────────────────────────────────
  {
    question: "¿Cómo creo un recordatorio desde la Agenda?",
    answer:
      "En la Agenda Procesal, tocá el ícono de campana en un plazo abierto (no vencido ni cerrado). Elegí cuántos días antes del vencimiento querés recibir la notificación (1, 3, 5 o 7 días antes). Recibirás un push el día indicado a las 9:00.",
  },
  {
    question: "¿Puedo poner recordatorios a cualquier expediente?",
    answer:
      "Sí. Podés agregar recordatorios a cualquier expediente que sigas, no solo a los que tienen plazos en la Agenda. Tocá la campana en la tarjeta del expediente o \"Agregar recordatorio\" en el detalle. Elegí fecha, hora, título y descripción personalizados.",
  },
  {
    question: "¿Dónde veo mis recordatorios programados?",
    answer:
      "En la sección superior de la Agenda Procesal aparece \"Recordatorios programados\" con los recordatorios activos. Podés eliminarlos tocando el ícono de papelera. Los recordatorios enviados o cancelados no se muestran ahí.",
  },
  // ── Agenda Procesal ──────────────────────────────────────────────────
  {
    question: "¿Qué es la Agenda Procesal?",
    answer:
      'La Agenda Procesal detecta automáticamente plazos legales dentro de los decretos de tus expedientes (por ejemplo, "plazo de 10 días hábiles"). Los organiza en secciones: Vencen hoy, Esta semana, Este mes, Más adelante y Vencidos.',
  },
  {
    question: "¿Los plazos de la Agenda Procesal se crean solos?",
    answer:
      "Sí. Cada vez que se sincronizan nuevos movimientos con decretos, el sistema analiza el texto y extrae los plazos detectados automáticamente. También podés entrar a la Agenda Procesal para verlos actualizados.",
  },
  {
    question: "¿Por qué algunos plazos ya aparecen vencidos?",
    answer:
      'Si la fecha de vencimiento ya pasó, el plazo se clasifica automáticamente como "Vencido". Esto puede ocurrir en expedientes importados que tenían decretos con plazos históricos.',
  },
  // ── Notificaciones ───────────────────────────────────────────────────
  {
    question: "¿Cómo activo las notificaciones push?",
    answer:
      "La primera vez que iniciás sesión, la app te pedirá permiso para enviar notificaciones. Si lo rechazaste, podés activarlas desde Configuración → Notificaciones de tu dispositivo, buscando IUE Pro.",
  },
  {
    question: "¿Qué tipo de notificaciones recibo?",
    answer:
      "Recibís alertas cuando hay nuevos movimientos en los expedientes que seguís, y recordatorios de plazos procesales próximos a vencer. Podés configurar qué tipo de alertas querés recibir desde Mi Perfil → Notificaciones.",
  },
  {
    question: "¿Qué es el resumen semanal por email?",
    answer:
      "Es un correo que te enviamos cada semana (el día que elijas) con un resumen de tus expedientes: plazos que vencen esa semana, actividad reciente (últimos movimientos) y expedientes inactivos (sin movimientos en más de 60 días). Activálo desde Mi Perfil → Notificaciones → Resumen semanal por email y elegí el día de envío (por defecto: lunes).",
  },
  {
    question: "Recibo notificaciones pero llegan a deshora, ¿es normal?",
    answer:
      "Las notificaciones se envían a las 8 a.m. y 8 p.m. (hora Uruguay). Si llegaran en horarios diferentes podría ser por un retraso en el servicio de mensajería push. Si persiste, contactanos.",
  },
  // ── Exportación PDF ──────────────────────────────────────────────────
  {
    question: "¿Puedo exportar un expediente a PDF?",
    answer:
      'Sí. En el detalle del expediente, bajá hasta la sección "Gestión del Expediente" y presioná "Exportar PDF". Se generará un documento con carátula, metadatos, partes, estadísticas e historial de movimientos. El archivo se nombra automáticamente con el número de IUE.',
  },
  {
    question: "¿Puedo exportar un decreto individual a PDF?",
    answer:
      'Sí. Tocá "Ver Decreto" o el número del decreto en cualquier movimiento. En el visor que se abre, tocá "Exportar PDF" en la parte superior. El PDF incluye el texto del decreto, el expediente asociado y la fecha del movimiento.',
  },
  // ── Dashboard ────────────────────────────────────────────────────────
  {
    question: "¿Qué muestra el Dashboard?",
    answer:
      "El Dashboard ofrece una vista general de todos tus expedientes: total de movimientos, etapas procesales detectadas, actividad reciente y estadísticas agregadas. Accedé desde el ícono de gráfico en la barra inferior.",
  },
  // ── Cuenta y contraseña ───────────────────────────────────────────────
  {
    question: "¿Olvidé mi contraseña, cómo la recupero?",
    answer:
      'En la pantalla de inicio de sesión, tocá "¿Olvidaste tu contraseña?". Ingresá tu email y te enviaremos un código de 6 dígitos. El código expira en 15 minutos. Si no lo recibís, revisá la carpeta de spam.',
  },
  {
    question: "¿Cómo elimino mi cuenta?",
    answer:
      'Andá a Mi Perfil → Configuración y bajá hasta el botón rojo "Eliminar cuenta". La eliminación es permanente e irreversible: se borrarán todos tus datos (expedientes seguidos, recordatorios, etiquetas, preferencias). Si tenés una suscripción activa, recordá cancelarla desde la configuración de tu dispositivo (App Store o Google Play) para evitar cobros futuros.',
  },
  // ── Suscripción ────────────────────────────────────────────────────────
  {
    question: "¿Cómo funciona la suscripción?",
    answer:
      "Podés seguir un expediente gratis para siempre, con notificaciones activas. Para agregar más expedientes y desbloquear funciones premium (agenda, comparar, sedes, tributos, dashboard, PDF, IA y agenda de turnos), necesitás IUE.uy Pro. Incluye 7 días de prueba gratuita con acceso completo. Luego podés continuar con el plan gratuito o suscribirte.",
  },
  {
    question: "¿Cuántos expedientes puedo seguir gratis?",
    answer:
      "Podés seguir un (1) expediente de forma gratuita para siempre, con notificaciones activas.",
  },
  {
    question: "¿Qué pasa si borro mi expediente gratis?",
    answer:
      "Si dejás de seguir tu único expediente gratuito, el cupo se considera consumido. Para seguir otro expediente necesitás suscribirte a IUE.uy Pro.",
  },
  {
    question: "¿Qué funcionalidades son premium?",
    answer:
      "Agenda procesal, comparar expedientes, sedes judiciales, tributos judiciales, dashboard, exportar PDF, resumen con IA y agendar turnos en el Poder Judicial.",
  },
  {
    question: "¿Qué incluye el período de prueba?",
    answer:
      "Durante el trial tenés acceso completo a todas las funcionalidades premium. Al finalizar, podés seguir usando tu cupo gratuito de un expediente o suscribirte para mantener todo desbloqueado.",
  },
  {
    question: "¿Cómo restauro mis compras?",
    answer:
      'Si reinstalaste la app o cambiás de dispositivo, tocá "Restaurar Compras" en la pantalla de suscripción. La app verificará con Apple o Google que tengas una suscripción activa y te dará acceso automáticamente.',
  },
  // ── Agenda Judicial ───────────────────────────────────────────────────
  {
    question: "¿Cómo agendo hora en el Poder Judicial?",
    answer:
      'Desde la lista de expedientes, seleccioná uno o varios (hasta 5) y tocá "Agendar". O desde el detalle de un expediente, tocá "Agendar Hora". Se abrirá la agenda judicial del Poder Judicial con el expediente pre-cargado. Para que el proceso sea más rápido, completá tu cédula y teléfono en Mi Perfil → Configuración.',
  },
  {
    question: "¿Por qué me pide cédula y teléfono al agendar?",
    answer:
      "Los datos de cédula y teléfono se usan para autocompletar el formulario de agendamiento del Poder Judicial. Si no los tenés cargados, podés agendar igual pero tendrás que ingresarlos manualmente en cada reserva. Completalos en Mi Perfil → Configuración para automatizar el proceso.",
  },
  // ── Etiquetas ─────────────────────────────────────────────────────────
  {
    question: "¿Cómo creo y gestiono etiquetas?",
    answer:
      'Andá a Mi Perfil → Configuración → Gestionar etiquetas. Podés crear etiquetas con nombre y color, editarlas o eliminarlas. Para asignar una etiqueta a un expediente, tocá el ícono de etiqueta en la tarjeta del expediente o en su detalle.',
  },
];
