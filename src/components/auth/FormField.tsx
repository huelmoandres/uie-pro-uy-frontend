import React from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Platform, Text, TextInput, TextInputProps, View } from "react-native";
import { useColorScheme } from "@/components/base/useColorScheme";

interface FormFieldProps<T extends FieldValues> extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur"
> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  disabled?: boolean;
  /** Transforma el valor antes de pasarlo al form (ej: solo números). */
  onChangeTransform?: (text: string) => string;
}

/**
 * Campo de formulario reutilizable: label + input + mensaje de error.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled = false,
  onChangeTransform,
  secureTextEntry,
  textContentType,
  ...inputProps
}: FormFieldProps<T>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // iOS: password = contraseñas guardadas; newPassword = generar fuerte / usar existente.
  const resolvedTextContentType =
    textContentType ??
    (Platform.OS === "ios" && secureTextEntry ? "password" : undefined);

  const selectionColor = isDark ? "#F8FAFC" : "#0F172A";
  const cursorColor = isDark ? "#F8FAFC" : "#0F172A";

  return (
    <View className="mb-5">
      <Text className="mb-2 ml-1 text-[10px] font-sans-bold uppercase tracking-[1.5px] text-accent">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`rounded-2xl bg-slate-50 border ${error ? "border-danger" : "border-slate-200"} px-5 py-2.5 font-sans text-sm text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white focus:border-accent`}
            placeholderTextColor="#94A3B8"
            selectionColor={selectionColor}
            cursorColor={cursorColor}
            textContentType={resolvedTextContentType}
            onBlur={onBlur}
            onChangeText={(text) =>
              onChange(onChangeTransform ? onChangeTransform(text) : text)
            }
            value={value ?? ""}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            {...inputProps}
          />
        )}
      />
      {error && (
        <Text className="mt-1 ml-1 text-[10px] font-sans-semi text-danger">
          {error}
        </Text>
      )}
    </View>
  );
}
