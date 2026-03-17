import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  User,
  CalendarClock,
  LayoutDashboard,
  Wrench,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/base/useColorScheme";

/**
 * Premium Tab Layout — Expedientes, Agenda, Utilidades, Dashboard, Mi Perfil.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme].tint;
  const inactiveColor = Colors[colorScheme].tabIconDefault;

  const tabBarContentHeight = 48;
  const tabBarHeight = tabBarContentHeight + Math.max(insets.bottom, 10);

  return (
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
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, focused }) => (
            <CalendarClock
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
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
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
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
  );
}
