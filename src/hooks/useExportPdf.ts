import { useState, useCallback } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { buildExpedientePdf } from '@utils/pdf-template';
import type { IExpediente } from '@app-types/expediente.types';

interface ExportState {
    isExporting: boolean;
    export: (expediente: IExpediente, notes?: string | null) => Promise<void>;
}

export function useExportPdf(): ExportState {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = useCallback(async (expediente: IExpediente, notes?: string | null) => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            const html = buildExpedientePdf(expediente, notes ?? null);

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Toast.show({
                    type: 'error',
                    text1: 'Compartir no disponible',
                    text2: 'Este dispositivo no soporta la función de compartir archivos.',
                });
                return;
            }

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Expediente ${expediente.iue}`,
                UTI: 'com.adobe.pdf',
            });

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            Toast.show({
                type: 'error',
                text1: 'Error al exportar',
                text2: message,
            });
        } finally {
            setIsExporting(false);
        }
    }, [isExporting]);

    return { isExporting, export: exportPdf };
}
