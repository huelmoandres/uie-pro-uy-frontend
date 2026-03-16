import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOOLTIP_MAX_WIDTH = SCREEN_WIDTH - 48;

interface ContextualTooltipProps {
  /** Mensaje del tooltip */
  message: string;
  /** Si se muestra el tooltip */
  visible: boolean;
  /** Callback al cerrar (ej: marcar como visto) */
  onDismiss: () => void;
  /** Posición preferida: "top" | "bottom" */
  placement?: "top" | "bottom";
  /** Contenido al que apunta el tooltip (se envuelve para medir) */
  children: React.ReactNode;
}

/**
 * Tooltip contextual que se muestra una vez.
 * Envuelve el elemento target y muestra un globo con mensaje.
 */
export function ContextualTooltip({
  message,
  visible,
  onDismiss,
  placement = "bottom",
  children,
}: ContextualTooltipProps) {
  const [targetLayout, setTargetLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const wrapperRef = useRef<View>(null);

  const measure = useCallback(() => {
    wrapperRef.current?.measureInWindow((x, y, width, height) => {
      setTargetLayout({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(measure, 350);
      return () => clearTimeout(t);
    } else {
      setTargetLayout(null);
    }
  }, [visible, measure]);

  return (
    <>
      <View
        ref={wrapperRef}
        onLayout={measure}
        collapsable={false}
      >
        {children}
      </View>
      {visible && (
        <Modal
          transparent
          visible
          animationType="fade"
          statusBarTranslucent
          onRequestClose={onDismiss}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
            <View style={styles.backdrop} />
          </Pressable>
          {targetLayout && (
            <View
              style={[
                styles.tooltipContainer,
                placement === "top"
                  ? {
                      bottom:
                        Dimensions.get("window").height - targetLayout.y + 8,
                      left: Math.max(
                        24,
                        Math.min(
                          targetLayout.x +
                            targetLayout.width / 2 -
                            TOOLTIP_MAX_WIDTH / 2,
                          SCREEN_WIDTH - TOOLTIP_MAX_WIDTH - 24,
                        ),
                      ),
                    }
                  : {
                      top: targetLayout.y + targetLayout.height + 8,
                      left: Math.max(
                        24,
                        Math.min(
                          targetLayout.x +
                            targetLayout.width / 2 -
                            TOOLTIP_MAX_WIDTH / 2,
                          SCREEN_WIDTH - TOOLTIP_MAX_WIDTH - 24,
                        ),
                      ),
                    },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Pressable onPress={onDismiss}>
                <View
                  className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-primary"
                  style={styles.bubble}
                >
                  <Text className="text-[13px] font-sans leading-[18px] text-slate-800 dark:text-slate-200">
                    {message}
                  </Text>
                  <Text className="mt-2 text-[11px] font-sans-semi text-accent">
                    Tocá para cerrar
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  tooltipContainer: {
    position: "absolute",
    width: TOOLTIP_MAX_WIDTH,
  },
  bubble: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(184, 145, 70, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
