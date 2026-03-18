import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import {
  ShieldAlert,
  Lock,
  EyeOff,
  Server,
  Bell,
  Sparkles,
  Trash2,
  Globe,
  UserCheck,
  StickyNote,
  Mail,
} from "lucide-react-native";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <View className="h-px bg-slate-100 dark:bg-white/5 mb-6 ml-11" />;
}

function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2 mb-1.5">
      <View className="mt-[7px] h-1.5 w-1.5 rounded-full bg-accent/60 shrink-0" />
      <Text className="flex-1 text-[13px] font-sans leading-relaxed text-slate-600 dark:text-slate-400">
        {text}
      </Text>
    </View>
  );
}

interface SectionProps {
  number: string;
  title: string;
  icon: React.ElementType;
  description?: string;
  bullets?: string[];
}

function PolicySection({
  number,
  title,
  icon: Icon,
  description,
  bullets,
}: SectionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent/10 mr-3 shrink-0">
          <Icon size={16} color="#B89146" />
        </View>
        <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white flex-1">
          {number}. {title}
        </Text>
      </View>
      <View className="pl-11">
        {description && (
          <Text className="text-[13px] font-sans leading-relaxed text-slate-600 dark:text-slate-400 mb-2">
            {description}
          </Text>
        )}
        {bullets?.map((b, i) => (
          <Bullet key={i} text={b} />
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrivacyScreen() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ title: "Privacidad" }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
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
          <Text className="text-[13px] font-sans text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Tu privacidad y la seguridad de tus datos son nuestra máxima
            prioridad. Leé cómo recopilamos, usamos y protegemos tu información.
          </Text>
        </View>

        {/* Sections card */}
        <View className="bg-white dark:bg-primary/50 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-premium dark:shadow-premium-dark">
          <PolicySection
            number="1"
            icon={EyeOff}
            title="Información que recopilamos"
            description="Para brindarte el servicio, almacenamos únicamente los datos estrictamente necesarios:"
            bullets={[
              "Dirección de correo electrónico y nombre para identificar tu cuenta.",
              "Teléfono y cédula de identidad (opcionales) para autocompletar el formulario de agendamiento en el Poder Judicial.",
              "Los números de IUE (expedientes) que decidís seguir.",
              "Metadatos de movimientos y decretos obtenidos del Poder Judicial.",
              "Notas personales que ingresás voluntariamente sobre cada expediente.",
              "Token de notificaciones push de tu dispositivo para enviarte alertas.",
              "Preferencias de notificaciones que configurás en la app.",
            ]}
          />
          <Divider />

          <PolicySection
            number="2"
            icon={Server}
            title="Sincronización con el Poder Judicial"
            description="Actuamos como intermediario transparente con los servicios públicos del Poder Judicial (SOAP). Los datos que consultamos son de carácter público y están disponibles en el portal oficial. Los almacenamos temporalmente para mejorar la velocidad de respuesta y tu experiencia de lectura. No modificamos ni alteramos en ningún caso la información oficial."
          />
          <Divider />

          <PolicySection
            number="3"
            icon={Lock}
            title="Seguridad de tus credenciales"
            bullets={[
              "Tu contraseña se almacena hasheada con bcrypt — nunca en texto plano.",
              "Los tokens de acceso se guardan en Secure Store (encriptado a nivel del sistema operativo).",
              "Usamos tokens JWT de corta duración con renovación automática.",
              "Todas las comunicaciones se realizan por HTTPS/TLS.",
            ]}
          />
          <Divider />

          <PolicySection
            number="4"
            icon={Sparkles}
            title="Uso de Inteligencia Artificial"
            description="La función 'Resumir con IA' envía el texto del decreto seleccionado a servicios externos de inteligencia artificial para generar un resumen. Antes de usar esta función, considerá que:"
            bullets={[
              "El texto del decreto se transmite a proveedores de IA (OpenAI / Google Gemini) únicamente cuando vos lo solicitás.",
              "No enviamos datos personales del expediente (nombre de partes, etc.), solo el texto del decreto.",
              "Los resúmenes generados se almacenan en nuestros servidores para evitar reprocesar el mismo decreto.",
              "Los resúmenes son orientativos y no constituyen asesoramiento jurídico.",
              "Si el decreto contiene información confidencial o reservada, te recomendamos no usar esta función.",
            ]}
          />
          <Divider />

          <PolicySection
            number="5"
            icon={Bell}
            title="Notificaciones push"
            description="Si otorgás permiso de notificaciones, tu token de dispositivo se almacena en nuestros servidores para poder enviarte alertas. Podés revocar este permiso en cualquier momento desde la configuración de tu dispositivo o desde Mi Perfil → Notificaciones en la app. Al desactivar las notificaciones se elimina tu token de nuestros registros."
          />
          <Divider />

          <PolicySection
            number="6"
            icon={StickyNote}
            title="Notas personales"
            description="Las notas que agregás a tus expedientes son de uso exclusivamente personal. Solo vos podés verlas — no las compartimos con terceros, no las usamos para análisis estadísticos, y se eliminan automáticamente si dejás de seguir el expediente o cerrás tu cuenta."
          />
          <Divider />

          <PolicySection
            number="7"
            icon={Globe}
            title="Servicios de terceros"
            description="La app integra los siguientes servicios externos para funcionar correctamente:"
            bullets={[
              "Expo / EAS — distribución de la app y actualizaciones OTA.",
              "RevenueCat — gestión de suscripciones (App Store / Google Play).",
              "Apple Push Notification Service (APNs) / Firebase Cloud Messaging (FCM) — envío de notificaciones push.",
              "OpenAI y Google Gemini — procesamiento de texto para resúmenes IA (solo bajo demanda).",
              "Brevo SMTP — envío de correos transaccionales (ej. mensajes de soporte, recuperación de contraseña).",
              "Poder Judicial del Uruguay (SOAP) — fuente oficial de datos de expedientes.",
            ]}
          />
          <Divider />

          <PolicySection
            number="8"
            icon={Trash2}
            title="Retención y eliminación de datos"
            bullets={[
              "Podés dejar de seguir un expediente en cualquier momento; sus datos dejan de sincronizarse.",
              "Podés eliminar tu cuenta directamente desde la app: Mi Perfil → Configuración → Eliminar cuenta. La eliminación es permanente e irreversible y borra todos tus datos (expedientes seguidos, recordatorios, etiquetas, preferencias).",
              "También podés solicitar la eliminación escribiéndonos a través de Soporte.",
              "Los datos de expedientes sin actividad por más de 12 meses pueden ser eliminados automáticamente de nuestros servidores.",
              "Los resúmenes de IA guardados se eliminan junto con tu cuenta.",
            ]}
          />
          <Divider />

          <PolicySection
            number="9"
            icon={UserCheck}
            title="Tus derechos"
            description="En cualquier momento tenés derecho a:"
            bullets={[
              "Acceder a todos los datos que tenemos asociados a tu cuenta.",
              "Rectificar información incorrecta (nombre, correo, teléfono, cédula).",
              "Eliminar tu cuenta en cualquier momento desde Configuración → Eliminar cuenta.",
              "Revocar los permisos de notificaciones push.",
              "Exportar tus expedientes en formato PDF.",
            ]}
          />
          <Divider />

          <PolicySection
            number="10"
            icon={Mail}
            title="Contacto"
            description="Para cualquier consulta sobre esta política, ejercer tus derechos o reportar un problema de privacidad, podés contactarnos a través de la sección Soporte dentro de la app o directamente a nuestro correo de soporte. Respondemos en un plazo máximo de 5 días hábiles."
          />
        </View>

        <Text className="mt-6 text-center text-[11px] font-sans text-slate-400">
          Última actualización: Marzo 2026
        </Text>
      </ScrollView>
    </View>
  );
}
