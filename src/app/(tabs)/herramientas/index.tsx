import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Bot, MapPin, Calculator, ChevronRight, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { PageContainer } from "@components/ui";
import { PremiumGateModal } from "@components/features";
import { usePremiumGate } from "@hooks";

const TOOLS = [
  {
    id: "ai-chat",
    title: "Asistente IA",
    description: "Consultá tus expedientes, plazos y derecho procesal",
    icon: Bot,
    href: "/herramientas/ai-chat",
    requiresPro: false,
  },
  {
    id: "sedes",
    title: "Sedes Judiciales",
    description: "Directorio de juzgados y tribunales",
    icon: MapPin,
    href: "/herramientas/sedes",
    requiresPro: true,
  },
  {
    id: "tributos",
    title: "Tributos Judiciales",
    description: "Vademécum de tasas e impuestos",
    icon: Calculator,
    href: "/herramientas/tributos",
    requiresPro: true,
  },
] as const;

export default function HerramientasScreen() {
  const {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal: showPremiumGateModal,
    featureParam,
    hidePremiumModal,
  } = usePremiumGate();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14 dark:bg-primary dark:border-white/5">
        <Text className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent">
          Utilidades
        </Text>
        <Text className="mt-0.5 text-[22px] font-sans-bold text-slate-900 dark:text-white">
          Utilidades
        </Text>
        <Text className="mt-2 text-[13px] font-sans text-slate-500 dark:text-slate-400">
          Consultas y recursos para tu práctica
        </Text>
      </View>

      <PageContainer withHeader={true}>
        <View className="pt-6 gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Pressable
                key={tool.id}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tool.requiresPro && !hasPremiumAccess) {
                    showPremiumModal(tool.id);
                    return;
                  }
                  router.push(tool.href);
                }}
                className="flex-row items-center overflow-hidden rounded-[24px] bg-white p-4 border border-slate-100 shadow-premium dark:bg-slate-900/40 dark:border-white/5 active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-900/60"
              >
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-accent/10">
                  {!tool.requiresPro || hasPremiumAccess ? (
                    <Icon size={22} color="#B89146" />
                  ) : (
                    <Lock size={18} color="#B89146" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[15px] font-sans-bold text-slate-900 dark:text-white">
                      {tool.title}
                    </Text>
                    {tool.requiresPro && !hasPremiumAccess && (
                      <Lock size={12} color="#B89146" />
                    )}
                  </View>
                  <Text className="mt-0.5 text-[12px] font-sans text-slate-500 dark:text-slate-400">
                    {tool.description}
                  </Text>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </Pressable>
            );
          })}
        </View>
      </PageContainer>

      <PremiumGateModal
        visible={showPremiumGateModal}
        onClose={hidePremiumModal}
        feature={featureParam}
      />
    </View>
  );
}
