import { useState, useCallback } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { buildExpedientePdf } from "@utils/pdf-template";
import type { IExpediente } from "@app-types/expediente.types";

interface ExportState {
  isExporting: boolean;
  export: (expediente: IExpediente) => Promise<void>;
}

export function useExportPdf(): ExportState {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(
    async (expediente: IExpediente) => {
      if (isExporting) return;
      setIsExporting(true);

      try {
        const html = buildExpedientePdf(expediente);

        // Sanitize IUE for use in filename (replace / and spaces with -)
        const safeIue = expediente.iue.replace(/\//g, "-").replace(/\s+/g, "-");
        const filename = `Expediente_${safeIue}.pdf`;

        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });

        // Rename to include IUE in filename
        const { uri: renamedUri } = await import("expo-file-system")
          .then(async (fs) => {
            const dir = uri.substring(0, uri.lastIndexOf("/") + 1);
            const dest = `${dir}${filename}`;
            await fs.moveAsync({ from: uri, to: dest });
            return { uri: dest };
          })
          .catch(() => ({ uri })); // fallback to original uri if rename fails

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          Toast.show({
            type: "error",
            text1: "Compartir no disponible",
            text2:
              "Este dispositivo no soporta la función de compartir archivos.",
          });
          return;
        }

        await Sharing.shareAsync(renamedUri, {
          mimeType: "application/pdf",
          dialogTitle: `Expediente ${expediente.iue}`,
          UTI: "com.adobe.pdf",
        });

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        Toast.show({
          type: "error",
          text1: "Error al exportar",
          text2: message,
        });
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting],
  );

  return { isExporting, export: exportPdf };
}
