import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import {
  Smartphone,
  Sparkles,
  Bell,
  CalendarCheck,
  FileText,
} from "lucide-react-native";
import { LEGAL_URLS } from "@/constants/legal";
import { useOnboarding } from "@context/OnboardingContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: Smartphone,
    title: "Tu estudio, siempre en el bolsillo",
    description:
      "Seguí tus expedientes y recibí alertas inmediatas cuando haya novedades.",
  },
  {
    id: "2",
    icon: Sparkles,
    title: "IA y plazos automáticos",
    description:
      "Resumí cada decreto en segundos. La IA detecta plazos procesales y te avisa antes de que venzan.",
  },
  {
    id: "3",
    icon: Bell,
    title: "Notificaciones y agenda",
    description:
      "Recordatorios personalizados, agendá turnos en el Poder Judicial y exportá todo a PDF.",
  },
  {
    id: "4",
    icon: CalendarCheck,
    title: "Control total",
    description:
      "Compará expedientes lado a lado, organizá con etiquetas y tené todo sincronizado.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { markOnboardingSeen } = useOnboarding();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleContinue = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markOnboardingSeen();
    router.replace({
      pathname: "/(tabs)",
      params: { openAddExpediente: "1" },
    });
  };

  const openTerms = () => {
    void WebBrowser.openBrowserAsync(LEGAL_URLS.TERMS_OF_USE);
  };

  const openPrivacy = () => {
    void WebBrowser.openBrowserAsync(LEGAL_URLS.PRIVACY_POLICY);
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Fondo: acentos sutiles */}
      <View className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-accent/10 dark:bg-accent/10" />
      <View className="absolute bottom-24 -left-16 h-52 w-52 rounded-full bg-accent/5 dark:bg-accent/5" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View className="flex-1 items-center justify-center px-8">
              <View className="mb-7 shadow-premium dark:shadow-premium-dark">
                <View className="h-[88px] w-[88px] items-center justify-center rounded-[28px] border border-accent/30 bg-accent/10 dark:border-accent/30 dark:bg-accent-muted">
                  <item.icon size={44} color="#B89146" strokeWidth={1.8} />
                </View>
              </View>
              <Text className="mb-3 text-center text-[22px] font-sans-bold text-slate-900 dark:text-slate-50">
                {item.title}
              </Text>
              <Text className="text-center text-[15px] font-sans leading-[22px] text-slate-600 dark:text-slate-400">
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View className="mb-5 flex-row items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i === currentIndex ? "w-6 bg-accent" : "w-2 bg-slate-300 dark:bg-white/20"
            }`}
          />
        ))}
      </View>

      {/* Legal text (last slide) */}
      {isLastSlide && (
        <View className="mb-2 px-7">
          <Text className="text-center text-[12px] font-sans leading-[18px] text-slate-500 dark:text-slate-400">
            Al continuar, aceptás nuestros{" "}
            <Text onPress={openTerms} className="font-sans-semi text-accent underline">
              Términos Legales (EULA)
            </Text>{" "}
            y{" "}
            <Text onPress={openPrivacy} className="font-sans-semi text-accent underline">
              Política de Privacidad
            </Text>
            .
          </Text>
        </View>
      )}

      {/* CTA */}
      <View className="px-6 pb-6">
        <Pressable
          onPress={handleContinue}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 px-5 shadow-md shadow-accent/25 active:scale-[0.98] dark:bg-accent"
        >
          <FileText size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-[13px] font-sans-bold uppercase tracking-wider text-white">
            Agregar mi primer expediente
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
  },
});
