import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  User,
  CalendarClock,
  LayoutDashboard,
  Wrench,
  Lock,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/base/useColorScheme";
import { PremiumGateModal } from "@components/features";
import { usePremiumGate } from "@hooks";

/**
 * Premium Tab Layout — Expedientes, Agenda, Utilidades, Dashboard, Mi Perfil.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const premiumGate = usePremiumGate();
  const activeColor = Colors[colorScheme].tint;
  const inactiveColor = Colors[colorScheme].tabIconDefault;
  const {
    hasAccess: hasPremiumAccess,
    showPremiumModal,
    showModal: showPremiumGateModal,
    featureParam,
    hidePremiumModal,
  } = premiumGate;

  const tabBarContentHeight = 48;
  const tabBarHeight = tabBarContentHeight + Math.max(insets.bottom, 10);

  return (
    <>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopWidth: 1,
          borderTopColor:
            colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "#F1F5F9",
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Expedientes",
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="deadline-agenda"
        listeners={{
          tabPress: (event) => {
            if (!hasPremiumAccess) {
              event.preventDefault();
              showPremiumModal("agenda");
            }
          },
        }}
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, focused }) => (
            <View className="relative">
              <CalendarClock
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {!hasPremiumAccess && (
                <View className="absolute -right-2 -top-1 rounded-full bg-amber-100 px-0.5 dark:bg-amber-500/20">
                  <Lock size={12} color="#B89146" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="herramientas"
        options={{
          title: "Utilidades",
          tabBarIcon: ({ color, focused }) => (
            <Wrench size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        listeners={{
          tabPress: (event) => {
            if (!hasPremiumAccess) {
              event.preventDefault();
              showPremiumModal("dashboard");
            }
          },
        }}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View className="relative">
              <LayoutDashboard
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {!hasPremiumAccess && (
                <View className="absolute -right-2 -top-1 rounded-full bg-amber-100 px-0.5 dark:bg-amber-500/20">
                  <Lock size={12} color="#B89146" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      </Tabs>

      <PremiumGateModal
        visible={showPremiumGateModal}
        onClose={hidePremiumModal}
        feature={featureParam}
      />
    </>
  );
}
