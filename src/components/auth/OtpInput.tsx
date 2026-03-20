import * as Clipboard from "expo-clipboard";
import React, { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { OTP_LENGTH } from "@constants/auth";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  /** Llamado cuando el OTP está completo (6 dígitos). Usar para auto-submit. */
  onComplete?: () => void;
  /** Ref del ScrollView padre para hacer scroll al enfocar y mostrar el input. */
  scrollViewRef?: React.RefObject<{ scrollToEnd: () => void } | null>;
}

/**
 * Input de OTP con cuadrados individuales para cada dígito.
 * Usa un TextInput oculto para capturar el teclado.
 * - Al completar el 6.º dígito, llama onComplete para auto-submit.
 * - Al enfocar, hace scroll para que el input sea visible.
 * - Pegar: long press en las cajas o botón "Pegar código" (expo-clipboard).
 */
export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  disabled = false,
  onComplete,
  scrollViewRef,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const digits = value.split("").concat(Array(length - value.length).fill(""));
  const isComplete = value.length === length;

  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, length);
    onChange(digitsOnly);
    if (digitsOnly.length === length && onComplete) {
      // Defer para que el form state se actualice antes del submit
      setTimeout(onComplete, 0);
    }
  };

  const handleFocus = () => {
    scrollViewRef?.current?.scrollToEnd();
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    const digitsOnly = text.replace(/\D/g, "").slice(0, length);
    if (digitsOnly.length > 0) {
      onChange(digitsOnly);
      if (digitsOnly.length === length && onComplete) {
        setTimeout(onComplete, 0);
      }
    }
  };

  return (
    <View className="items-center gap-3">
      <Pressable
        onPress={() => inputRef.current?.focus()}
        onLongPress={handlePaste}
        delayLongPress={400}
        className="flex-row gap-2 relative"
      >
        {digits.map((digit, index) => {
          const isFilled = Boolean(digit);
          const isActive = index === value.length;
          return (
            <View
              key={index}
              className={`flex-1 h-14 min-w-0 max-w-14 items-center justify-center rounded-xl border-2
                              ${
                                isFilled
                                  ? "border-accent bg-accent/5 dark:bg-accent/10"
                                  : isActive
                                    ? "border-accent bg-white dark:bg-white/10"
                                    : "border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/5"
                              }
                          `}
            >
              <Text className="text-xl font-sans-bold text-slate-900 dark:text-white">
                {digit}
              </Text>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          keyboardType="number-pad"
          editable={!disabled}
          autoComplete="one-time-code"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            fontSize: 1,
          }}
        />
      </Pressable>

      {!isComplete && !disabled && (
        <Pressable onPress={handlePaste} hitSlop={8}>
          <Text className="text-xs text-accent font-sans-medium">
            Pegar código
          </Text>
        </Pressable>
      )}
    </View>
  );
}
