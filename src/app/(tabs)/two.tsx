import React, { useState } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { useSubscription } from "@context/SubscriptionContext";
import { PageContainer, ConfirmationModal, InfoButton } from "@components/ui";
import {
  User,
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Crown,
} from "lucide-react-native";
import { INFO_HINTS } from "@/constants/InfoHints";

/**
 * Premium Profile Screen (Tab Two)
 * Features a clean, professional layout and logout functionality.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isPro, isInTrial } = useSubscription();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const badgeLabel = isInTrial
    ? "En período de prueba"
    : isPro
      ? "Pro"
      : "ABOGADO/A";

  const menuItems = [
    {
      icon: Crown,
      label: isPro || isInTrial ? "IUE Pro - Activo" : "IUE Pro - Suscribirse",
      color: "#B89146",
      route: "/paywall",
    },
    {
      icon: Settings,
      label: "Configuración",
      color: "#64748B",
      route: "/settings",
    },
    {
      icon: Bell,
      label: "Notificaciones",
      color: "#64748B",
      route: "/notifications",
    },
    { icon: Shield, label: "Privacidad", color: "#64748B", route: "/privacy" },
    {
      icon: HelpCircle,
      label: "Ayuda y Soporte",
      color: "#64748B",
      route: "/support",
    },
  ];

  return (
    <PageContainer withHeader={false}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="items-center mb-10 px-6">
          <View className="w-full max-w-[320px]">
            <View className="flex-row justify-end mb-2">
              <InfoButton
                title={INFO_HINTS.perfilInfo.title}
                description={INFO_HINTS.perfilInfo.description}
                size={18}
              />
            </View>
            <View className="items-center">
              <View className="h-24 w-24 rounded-[32px] bg-primary items-center justify-center shadow-premium-dark border border-white/10 mb-4">
                <User size={48} color="#B89146" />
              </View>
              <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white">
                {user?.name || user?.email?.split("@")[0] || "Abogado"}
              </Text>
              <Text className="text-sm font-sans text-slate-500 mt-1">
                {user?.email}
              </Text>

              <View className="mt-4 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/20">
                <Text className="text-[10px] font-sans-bold text-accent uppercase tracking-widest">
                  {badgeLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="mb-10">
          <Text className="text-[10px] font-sans-bold text-slate-400 uppercase tracking-[2px] mb-4 ml-1">
            Mi Cuenta
          </Text>
          <View className="bg-white dark:bg-primary/50 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-premium dark:shadow-premium-dark">
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => item.route && router.push(item.route as any)}
                className={`flex-row items-center justify-between p-4 px-6 active:bg-slate-50 dark:active:bg-white/5 ${index !== menuItems.length - 1 ? "border-b border-slate-50 dark:border-white/5" : ""}`}
              >
                <View className="flex-row items-center">
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 mr-4">
                    <item.icon size={18} color="#B89146" />
                  </View>
                  <Text className="font-sans-semi text-sm text-slate-700 dark:text-slate-300">
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout Action */}
        <Pressable
          onPress={() => setIsLogoutModalVisible(true)}
          className="flex-row items-center justify-center bg-danger/10 border border-danger/20 rounded-[24px] py-4 active:bg-danger/20"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="font-sans-bold text-danger text-sm ml-3">
            Cerrar Sesión
          </Text>
        </Pressable>

        <View className="mt-12 items-center">
          <Text className="text-[10px] font-sans text-slate-400 uppercase tracking-widest">
            UIE Pro Uy v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="¿Cerrar Sesión?"
        description="Tendrás que volver a ingresar tus credenciales para acceder a tus expedientes."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        onConfirm={signOut}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </PageContainer>
  );
}
