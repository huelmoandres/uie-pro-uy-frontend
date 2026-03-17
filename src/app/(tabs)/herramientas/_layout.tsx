import { Stack } from "expo-router";

/**
 * Stack de Herramientas: índice + Sedes + Tributos (+ futuras utilidades).
 */
export default function HerramientasLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sedes" />
      <Stack.Screen name="tributos" />
    </Stack>
  );
}
