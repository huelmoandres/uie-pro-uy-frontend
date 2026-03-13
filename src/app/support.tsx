import React, { useState } from "react";
import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { HelpCircle, MessageSquare } from "lucide-react-native";
import { PageContainer } from "@components/ui";
import {
  ContactSupportModal,
  FaqAccordion,
} from "@components/features";
import { InfoBanner } from "@components/shared/InfoBanner";
import { FAQS } from "@constants/faqs";

export default function SupportScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <PageContainer scrollable>
        <Stack.Screen options={{ title: "Soporte y Ayuda" }} />

        <View className="p-4 pt-6">
          <InfoBanner
            icon={HelpCircle}
            iconSize={100}
            title="¿Necesitás ayuda?"
            description="Nuestro equipo está disponible para ayudarte con cualquier consulta sobre la plataforma."
            ctaLabel="Enviar mensaje"
            ctaIcon={MessageSquare}
            onCtaPress={() => setModalVisible(true)}
          />
        </View>

        <View className="p-4">
          <Text className="ml-2 mb-3 text-xs font-sans-bold text-slate-500 uppercase tracking-wider">
            Preguntas Frecuentes
          </Text>
          <FaqAccordion
            items={FAQS}
            openIndex={openIndex}
            onToggle={toggleAccordion}
          />
        </View>
      </PageContainer>

      <ContactSupportModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
