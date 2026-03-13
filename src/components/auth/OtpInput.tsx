import React, { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { OTP_LENGTH } from "@constants/auth";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

/**
 * Input de OTP con cuadrados individuales para cada dígito.
 * Usa un TextInput oculto para capturar el teclado y soportar pegado.
 */
export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  disabled = false,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const digits = value.split("").concat(Array(length - value.length).fill(""));

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, "").slice(0, length));
  };

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className="flex-row gap-2"
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
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        className="absolute opacity-0 h-0 w-0"
        autoComplete="one-time-code"
      />
    </Pressable>
  );
}
