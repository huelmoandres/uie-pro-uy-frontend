import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Fingerprint, ScanFace, LogOut } from "lucide-react-native";
import { useAuth } from "@context/AuthContext";
import { APP_NAME } from "@/constants/app.constants";

interface BiometricLockScreenProps {
  biometricType: "faceid" | "fingerprint" | "iris" | null;
  onAuthenticate: () => Promise<boolean>;
  onUnlock: () => void;
}

export function BiometricLockScreen({
  biometricType,
  onAuthenticate,
  onUnlock,
}: BiometricLockScreenProps) {
  const { signOut } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const isAuthenticatingRef = useRef(false);

  const triggerAuth = useCallback(async () => {
    if (isAuthenticatingRef.current) return;
    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);
    try {
      const ok = await onAuthenticate();
      if (ok) {
        onUnlock();
      } else {
        setFailCount((c) => c + 1);
      }
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, [onAuthenticate, onUnlock]);

  useEffect(() => {
    void triggerAuth();
  }, [triggerAuth]);

  const handleSignOut = async () => {
    await signOut();
  };

  const BiometricIcon =
    biometricType === "faceid" || biometricType === "iris"
      ? ScanFace
      : Fingerprint;

  const biometricLabel =
    biometricType === "faceid"
      ? "Desbloquear con Face ID"
      : biometricType === "iris"
        ? "Desbloquear con iris"
        : "Desbloquear con huella";

  return (
    <View className="flex-1 bg-primary items-center justify-center px-8">
      <View className="items-center gap-6 w-full max-w-xs">
        <Image
          source={require("../../../assets/images/icon.png")}
          className="w-24 h-24 rounded-[32px] shadow-2xl"
          resizeMode="cover"
        />

        <View className="items-center gap-2">
          <Text className="text-2xl font-sans-bold text-white">
            {APP_NAME}
          </Text>
          <Text className="text-sm font-sans text-white/60 text-center">
            Verificá tu identidad para continuar
          </Text>
        </View>

        <Pressable
          onPress={triggerAuth}
          disabled={isAuthenticating}
          className="mt-4 items-center justify-center w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 active:scale-95"
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#B89146" />
          ) : (
            <BiometricIcon size={36} color="#B89146" />
          )}
        </Pressable>

        <Text className="text-sm font-sans-semi text-accent">
          {biometricLabel}
        </Text>

        {failCount >= 2 && (
          <Pressable
            onPress={handleSignOut}
            className="mt-2 flex-row items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 active:bg-white/10"
          >
            <LogOut size={16} color="#94A3B8" />
            <Text className="text-sm font-sans-semi text-slate-400">
              Usar contraseña
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
