import React from "react";
import { Text, View } from "react-native";

/** Limpia tags HTML residuales y normaliza saltos de línea. */
function normalizeContent(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Renderiza texto con soporte de bold (**texto**). */
function InlineLine({ text, baseClass }: { text: string; baseClass: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text className={baseClass}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} className={`${baseClass} font-sans-bold`}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

interface MarkdownTextProps {
  /** Contenido en markdown básico (bold, listas, párrafos). */
  content: string;
  /** Si se está haciendo streaming, agrega el cursor ▌ al final. */
  isStreaming?: boolean;
  /** Clases de texto base (color, tamaño, font). */
  textClass: string;
}

/**
 * Renderizador de markdown mínimo para respuestas de modelos LLM.
 * Soporta: **bold**, listas con `- ` o `* `, párrafos y saltos de línea.
 * No requiere dependencias externas.
 */
export function MarkdownText({ content, isStreaming, textClass }: MarkdownTextProps) {
  const normalized = normalizeContent(content);
  const lines = normalized.split("\n");

  return (
    <View style={{ gap: 2 }}>
      {lines.map((line, i) => {
        const isBullet = /^[-*]\s+/.test(line);
        const isLast = i === lines.length - 1;
        const cursor = isStreaming && isLast ? "▌" : "";

        if (isBullet) {
          const bulletText = line.replace(/^[-*]\s+/, "");
          return (
            <View key={i} className="flex-row" style={{ gap: 6 }}>
              <Text className={textClass} style={{ lineHeight: 22 }}>
                •
              </Text>
              <View className="flex-1">
                <InlineLine
                  text={bulletText + cursor}
                  baseClass={`${textClass} leading-[22px]`}
                />
              </View>
            </View>
          );
        }

        if (line.trim() === "") {
          return <View key={i} style={{ height: 6 }} />;
        }

        return (
          <InlineLine
            key={i}
            text={line + cursor}
            baseClass={`${textClass} leading-[22px]`}
          />
        );
      })}
    </View>
  );
}
