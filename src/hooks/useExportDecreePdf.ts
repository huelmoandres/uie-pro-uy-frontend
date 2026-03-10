import { useState, useCallback } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { buildDecreePdf } from '@utils/pdf-template';
import type { IDecree } from '@app-types/expediente.types';
import type { IDecreePdfContext } from '@utils/pdf-template';

interface ExportState {
    isExporting: boolean;
    export: (decree: IDecree, context?: IDecreePdfContext) => Promise<void>;
}

export function useExportDecreePdf(): ExportState {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = useCallback(async (decree: IDecree, context?: IDecreePdfContext) => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            const html = buildDecreePdf(decree, context);

            // Identificador del decreto: nroDecreto > fecha del movimiento > id corto
            const decreePart = decree.nroDecreto
                ? decree.nroDecreto.replace(/[/\s]/g, '-')
                : context?.movementFecha
                    ? context.movementFecha.slice(0, 10).replace(/-/g, '') // 2024-03-15 → 20240315
                    : decree.id.slice(-8);
            const iuePart = context?.expedienteIue?.replace(/\//g, '-') ?? 'exp';
            const filename = `Decreto_${decreePart}_${iuePart}.pdf`;

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            const { uri: renamedUri } = await import('expo-file-system').then(async (fs) => {
                const dir = uri.substring(0, uri.lastIndexOf('/') + 1);
                const dest = `${dir}${filename}`;
                await fs.moveAsync({ from: uri, to: dest });
                return { uri: dest };
            }).catch(() => ({ uri }));

            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Toast.show({
                    type: 'error',
                    text1: 'Compartir no disponible',
                    text2: 'Este dispositivo no soporta la función de compartir archivos.',
                });
                return;
            }

            await Sharing.shareAsync(renamedUri, {
                mimeType: 'application/pdf',
                dialogTitle: `Decreto ${decree.nroDecreto ?? 'Judicial'}`,
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
