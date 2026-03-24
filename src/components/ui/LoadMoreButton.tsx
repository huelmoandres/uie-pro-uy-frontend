import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

export interface LoadMoreButtonProps {
  onPress: () => void;
  /** Si true, muestra spinner y deshabilita el botón */
  loading?: boolean;
  /** Cantidad cargada (ej: 15) */
  loadedCount?: number;
  /** Total disponible (ej: 50) → muestra "Ver más (15 de 50)" */
  totalCount?: number;
  /** Alternativa: cantidad restante → muestra "Ver más (35 restantes)" */
  remainingCount?: number;
  /** Clase adicional para el contenedor */
  className?: string;
}

/**
 * Botón reutilizable para paginación tipo "Ver más" / load more.
 * Usado en recordatorios, movimientos de expediente, etc.
 */
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = React.memo(
  ({
    onPress,
    loading = false,
    loadedCount,
    totalCount,
    remainingCount,
    className = "",
  }) => {
    const getLabel = () => {
      if (loading) return null;
      if (loadedCount != null && totalCount != null && totalCount > 0) {
        return `Ver más (${loadedCount} de ${totalCount})`;
      }
      if (remainingCount != null && remainingCount > 0) {
        return `Ver más (${remainingCount} restantes)`;
      }
      return "Ver más";
    };

    const label = getLabel();
    if (!label && !loading) return null;

    return (
      <Pressable
        onPress={onPress}
        disabled={loading}
        className={`mt-3 py-3 rounded-xl bg-accent/10 border border-accent/20 items-center justify-center active:opacity-70 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#B89146" />
        ) : (
          <Text className="text-[13px] font-sans-semi text-accent">
            {label}
          </Text>
        )}
      </Pressable>
    );
  },
);
LoadMoreButton.displayName = "LoadMoreButton";
