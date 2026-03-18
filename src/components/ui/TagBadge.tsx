import React from "react";
import { Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import type { ITag } from "@app-types/tag.types";

interface Props {
  tag: ITag;
  /** Si se provee, muestra un botón X para remover el tag. */
  onRemove?: (tagId: string) => void;
  /** Tamaño extra-small para la card de expediente; default es 'sm'. */
  size?: "xs" | "sm";
}

/**
 * Pill badge que muestra el nombre de la etiqueta con su color de fondo.
 * Variant 'xs' para la ExpedienteCard (muy compacto).
 * Variant 'sm' (default) para vistas de detalle y gestión.
 */
export const TagBadge = React.memo(({ tag, onRemove, size = "sm" }: Props) => {
  // Determinar si el color es oscuro para ajustar el texto
  const isXs = size === "xs";

  return (
    <View
      className={`flex-row items-center rounded-full ${isXs ? "px-2 py-0.5 gap-1" : "px-2.5 py-1 gap-1.5"}`}
      style={{ backgroundColor: tag.color + "22" }} // 13% opacity background
    >
      <View
        className={`rounded-full ${isXs ? "w-1.5 h-1.5" : "w-2 h-2"}`}
        style={{ backgroundColor: tag.color }}
      />
      <Text
        className={`font-sans-semi ${isXs ? "text-[9px]" : "text-[11px]"}`}
        style={{ color: tag.color }}
        numberOfLines={1}
      >
        {tag.name}
      </Text>
      {onRemove && (
        <Pressable
          onPress={() => onRemove(tag.id)}
          hitSlop={6}
          className="active:opacity-60"
        >
          <X size={isXs ? 8 : 10} color={tag.color} />
        </Pressable>
      )}
    </View>
  );
});
TagBadge.displayName = "TagBadge";
