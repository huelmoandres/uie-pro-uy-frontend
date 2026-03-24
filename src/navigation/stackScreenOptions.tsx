import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@components/shared/HeaderBackButton";

export function getStackScreenOptions(
  isDark: boolean,
): NativeStackNavigationOptions {
  return {
    headerStyle: {
      backgroundColor: isDark ? "#0B1120" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    } as NativeStackNavigationOptions["headerStyle"],
    headerTitleStyle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      color: isDark ? "#F8FAFC" : "#0F172A",
    },
    headerTitleAlign: "center",
    headerShadowVisible: false,
    headerBackTitle: "",
    headerBackVisible: false,
    headerLeft: ({ canGoBack }) => (canGoBack ? <HeaderBackButton /> : null),
  };
}
