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
    question: "¿La app funciona sin conexión a internet?",
    answer:
      "La app muestra los datos que ya tenés sincronizados aunque no tengas internet: tus expedientes, movimientos guardados, notas, recordatorios y plazos de la Agenda. Las acciones que requieren conexión son: sincronizar nuevos movimientos, usar el resumen con IA, agendar horas y verificar tu suscripción. La app te avisará si intentás hacer algo que necesita internet.",
  },
  {
    question: "¿Por qué la información puede diferir del portal del Poder Judicial?",
    answer:
      "La app consulta los mismos sistemas públicos del Poder Judicial (SOAP), pero puede haber diferencias por el momento de la última sincronización. La fuente oficial siempre es el portal del Poder Judicial (pj.gub.uy). IUE Pro es una herramienta de seguimiento y asistencia, no un reemplazo de la consulta oficial. Siempre verificá la información en el portal antes de tomar decisiones procesales.",
  },
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
  // ── Seguridad biométrica ──────────────────────────────────────────────
  {
    question: "¿Puedo proteger la app con Face ID o huella dactilar?",
    answer:
      "Sí. Una vez que iniciás sesión, la app te ofrece activar la autenticación biométrica (Face ID en iPhone, huella dactilar en Android). Si la activás, cada vez que abras la app desde segundo plano se te pedirá tu biometría antes de acceder. Podés activarla o desactivarla desde Mi Perfil → Configuración.",
  },
  // ── Cuenta y contraseña ───────────────────────────────────────────────
  {
    question: "¿Olvidé mi contraseña, cómo la recupero?",
    answer:
      'En la pantalla de inicio de sesión, tocá "¿Olvidaste tu contraseña?". Ingresá tu email y te enviaremos un código de 6 dígitos. El código expira en 15 minutos. Si no lo recibís, revisá la carpeta de spam.',
  },
  {
    question: "No me llegó el código OTP, ¿qué hago?",
    answer:
      "Primero revisá la carpeta de spam o correo no deseado. Si tampoco está ahí, esperá unos minutos y pedí un nuevo código tocando \"Reenviar código\". Asegurate de que el email ingresado sea el correcto. Si el problema persiste, contactanos desde Soporte.",
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
    question: "¿Qué pasa si dejo de seguir mi expediente gratis?",
    answer:
      "Si dejás de seguir tu único expediente gratuito y te quedás sin ninguno activo, el cupo se libera automáticamente. Eso significa que podés empezar a seguir un expediente diferente sin necesidad de suscribirte. Si agregás un segundo expediente mientras ya tenés uno activo, ahí sí necesitás IUE.uy Pro.",
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
  // ── Novedades de Hoy ─────────────────────────────────────────────────
  {
    question: "¿Qué son las Novedades de hoy?",
    answer:
      'Es una vista que muestra todos tus expedientes que tuvieron movimientos hoy (según hora Uruguay). Podés acceder tocando el botón "Novedades de hoy" en la pantalla de Mis Expedientes, o directamente desde la notificación push del mediodía. Incluye buscador y filtros para localizar rápidamente lo que te interesa.',
  },
  // ── Privacidad y datos ────────────────────────────────────────────────
  {
    question: "¿Me van a mandar emails de marketing?",
    answer:
      "Sí, pero de forma muy acotada. Podemos enviarte hasta 4 tipos de email en toda tu vida en la app: uno si no agregaste ningún expediente, uno si no verificaste tu email, uno sugiriéndote invitar a colegas, y una encuesta de satisfacción a los 7 días de uso. Cada email incluye un link para darte de baja con un clic. Si cancelás, no te enviamos ningún email de campaña más.",
  },
  {
    question: "¿La app registra o trackea mi actividad?",
    answer:
      "Sí, usamos PostHog (servidor en la Unión Europea) para analizar cómo se utiliza la app y mejorar la experiencia. Se registran eventos como: pantallas visitadas, funcionalidades usadas y flujos de suscripción. NO se registra el contenido de tus expedientes, decretos, notas personales ni ningún dato judicial. También activamos Session Replay para detectar problemas de usabilidad: todos los campos de texto aparecen enmascarados (****) y nunca se captura lo que escribís. Podés pedir la eliminación de tus datos de analíticas contactando a Soporte.",
  },
  // ── Etiquetas ─────────────────────────────────────────────────────────
  {
    question: "¿Cómo creo y gestiono etiquetas?",
    answer:
      'Andá a Mi Perfil → Configuración → Gestionar etiquetas. Podés crear etiquetas con nombre y color, editarlas o eliminarlas. Para asignar una etiqueta a un expediente, tocá el ícono de etiqueta en la tarjeta del expediente o en su detalle.',
  },
  // ── Referidos ─────────────────────────────────────────────────────────
  {
    question: "¿Cómo funciona el programa de referidos?",
    answer:
      'Es un sistema Win-Win. Encontrás tu código en Mi Perfil → Referidos y lo compartís con colegas. Cuando alguien se registra con tu código recibe 7 días de Pro gratis. Si además se suscribe, vos ganás 1 mes extra (30 días) de acceso Pro acreditado automáticamente.',
  },
  {
    question: "¿Qué gana el colega que recibe mi código?",
    answer:
      '7 días de acceso Pro completamente gratis al registrarse, sin necesidad de suscribirse primero. Recibirá un email de bienvenida confirmando el beneficio.',
  },
  {
    question: "¿Cuándo se acredita el mes para mí?",
    answer:
      'El mes se acredita en el momento en que el colega que invitaste confirma su primera suscripción Pro. Recibirás un email de confirmación avisándote que el beneficio fue acreditado.',
  },
  {
    question: "¿Cómo funciona el mes ganado si tengo suscripción activa?",
    answer:
      'El mes se suma al final de tu período de suscripción actual. Apple gestiona automáticamente los ciclos de cobro, por lo que el beneficio se refleja como una extensión de tu acceso: cuando tu suscripción regular venza o la canceles, seguirás siendo Pro por los meses acumulados. Son como un "seguro" o reserva de acceso Pro.',
  },
  {
    question: "¿Los meses son acumulables?",
    answer:
      'Sí. Cada colega que invitás y se suscribe suma 1 mes más (30 días). Si invitás a 4 personas, tenés 4 meses extra de Pro "en el banco". No hay límite de invitados.',
  },
  {
    question: "¿Puedo aplicar un código de invitación después de registrarme?",
    answer:
      'Sí, podés aplicarlo en cualquier momento desde Mi Perfil → Referidos, mientras no hayas ingresado uno antes. Solo se puede aplicar un código por cuenta. Los días gratis se acreditan al ingresar el código.',
  },
];
