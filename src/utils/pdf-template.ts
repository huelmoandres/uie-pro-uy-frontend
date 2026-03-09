/**
 * Builds the HTML string used to render the expediente PDF via expo-print.
 * Pure function — no side effects, fully testable.
 */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { stripHtml, formatDate } from './formatters';
import { isInternalGroup, flattenTimeline } from '@app-types/expediente.types';
import type { IExpediente } from '@app-types/expediente.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function stageLabel(stage: string): string {
    const map: Record<string, string> = {
        FILING: 'Presentación',
        PRELIMINARY: 'Preliminar',
        EVIDENCE: 'Prueba',
        PLEADINGS: 'Alegatos',
        JUDGMENT: 'Sentencia',
        APPEAL: 'Recursos',
        ENFORCEMENT: 'Ejecución',
    };
    return map[stage] ?? stage;
}

function categoryLabel(category: string): string {
    const map: Record<string, string> = {
        DECREE: 'Decreto',
        NOTIFICATION: 'Notificación',
        WRITING: 'Escrito',
        AUDIENCE: 'Audiencia',
        INTERNAL: 'Interno',
    };
    return map[category] ?? category;
}

function categoryColor(category: string): string {
    const map: Record<string, string> = {
        DECREE: '#1E3A5F',
        NOTIFICATION: '#7C3AED',
        WRITING: '#0369A1',
        AUDIENCE: '#B45309',
        INTERNAL: '#6B7280',
    };
    return map[category] ?? '#6B7280';
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildExpedientePdf(expediente: IExpediente, notes: string | null): string {
    const generatedAt = format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es });
    const caratula = stripHtml(expediente.caratula) || 'Sin carátula registrada';
    const movements = flattenTimeline(expediente.movements);

    // ── Movements rows ─────────────────────────────────────────────────────
    const movementRows = movements.map((m) => {
        const category = m.classification?.type ?? 'INTERNAL';
        const color = categoryColor(category);
        const label = categoryLabel(category);
        const hasDecree = !!m.decree?.textoDecreto;
        const decreto = hasDecree
            ? `<span style="font-size:9px;color:#059669;">&#10003; Decreto</span>`
            : '';
        return `
        <tr>
            <td style="padding:7px 10px;border-bottom:1px solid #F1F5F9;white-space:nowrap;">
                ${esc(formatDate(m.fecha))}
            </td>
            <td style="padding:7px 10px;border-bottom:1px solid #F1F5F9;">
                <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:600;color:${color};background:${color}18;border:1px solid ${color}30;">
                    ${label}
                </span>
            </td>
            <td style="padding:7px 10px;border-bottom:1px solid #F1F5F9;font-size:11px;color:#334155;">
                ${esc(m.tipo)} ${decreto}
            </td>
            <td style="padding:7px 10px;border-bottom:1px solid #F1F5F9;font-size:10px;color:#64748B;">
                ${esc(m.sede)}
            </td>
        </tr>`;
    }).join('');

    // ── Parties section ────────────────────────────────────────────────────
    const partiesHtml = expediente.parties
        ? `
        <div class="section">
            <div class="section-title">Partes</div>
            <table style="width:100%;border-collapse:collapse;">
                ${expediente.parties.plaintiff ? `
                <tr>
                    <td style="padding:5px 0;width:110px;font-size:11px;color:#64748B;font-weight:600;">Actor</td>
                    <td style="padding:5px 0;font-size:11px;color:#1E293B;">${esc(expediente.parties.plaintiff)}</td>
                </tr>` : ''}
                ${expediente.parties.defendant ? `
                <tr>
                    <td style="padding:5px 0;font-size:11px;color:#64748B;font-weight:600;">Demandado</td>
                    <td style="padding:5px 0;font-size:11px;color:#1E293B;">${esc(expediente.parties.defendant)}</td>
                </tr>` : ''}
                ${expediente.parties.caseType ? `
                <tr>
                    <td style="padding:5px 0;font-size:11px;color:#64748B;font-weight:600;">Tipo</td>
                    <td style="padding:5px 0;font-size:11px;color:#1E293B;">${esc(expediente.parties.caseType)}</td>
                </tr>` : ''}
            </table>
        </div>`
        : '';

    // ── Notes section ──────────────────────────────────────────────────────
    const notesHtml = notes
        ? `
        <div class="section" style="page-break-inside:avoid;">
            <div class="section-title">Mis Notas</div>
            <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 14px;font-size:11px;color:#78350F;line-height:1.6;white-space:pre-wrap;">${esc(notes)}</div>
        </div>`
        : '';

    // ── Stage + activity badges ────────────────────────────────────────────
    const stageBadge = expediente.stage
        ? `<span style="display:inline-block;padding:3px 10px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:20px;font-size:10px;font-weight:600;color:#1D4ED8;">
            ${stageLabel(expediente.stage.stage)}
           </span>`
        : '';

    const activityBadge = expediente.prediction
        ? (() => {
            const map: Record<string, { bg: string; color: string; label: string }> = {
                ACTIVE:   { bg: '#F0FDF4', color: '#15803D', label: 'Activo' },
                ON_TRACK: { bg: '#EFF6FF', color: '#1D4ED8', label: 'En curso' },
                DELAYED:  { bg: '#FFFBEB', color: '#B45309', label: 'Demorado' },
                DORMANT:  { bg: '#F1F5F9', color: '#475569', label: 'Inactivo' },
                UNKNOWN:  { bg: '#F1F5F9', color: '#6B7280', label: 'Desconocido' },
            };
            const s = map[expediente.prediction.status] ?? map.UNKNOWN;
            return `<span style="display:inline-block;padding:3px 10px;background:${s.bg};border:1px solid ${s.color}30;border-radius:20px;font-size:10px;font-weight:600;color:${s.color};">${s.label}</span>`;
        })()
        : '';

    // ── Stats row ──────────────────────────────────────────────────────────
    const statsHtml = expediente.stats?.totalMovements != null
        ? `
        <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;">
            <div class="stat-box">
                <div class="stat-label">Total movimientos</div>
                <div class="stat-value">${expediente.totalMovimientos}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Primer movimiento</div>
                <div class="stat-value">${formatDate(expediente.stats.firstMovementDate)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Último movimiento</div>
                <div class="stat-value">${formatDate(expediente.stats.lastMovementDate)}</div>
            </div>
            ${expediente.stats.averageDaysBetweenMovements != null ? `
            <div class="stat-box">
                <div class="stat-label">Promedio entre mov.</div>
                <div class="stat-value">${Math.round(expediente.stats.averageDaysBetweenMovements)} días</div>
            </div>` : ''}
        </div>`
        : '';

    // ── Full HTML document ─────────────────────────────────────────────────
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #1E293B;
    background: #FFFFFF;
    padding: 36px 40px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #1E3A5F;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand { font-size: 11px; font-weight: 700; color: #C5A059; letter-spacing: 2px; text-transform: uppercase; }
  .title { font-size: 20px; font-weight: 700; color: #1E3A5F; margin-top: 4px; }
  .iue-badge {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 8px 14px;
    text-align: right;
  }
  .iue-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
  .iue-value { font-size: 15px; font-weight: 700; color: #1E3A5F; margin-top: 2px; }
  .caratula {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    line-height: 1.5;
    background: #F8FAFC;
    border-left: 3px solid #C5A059;
    padding: 10px 14px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 20px;
  }
  .meta-grid {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .meta-item { flex: 1; min-width: 160px; }
  .meta-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .meta-value { font-size: 12px; font-weight: 600; color: #1E293B; }
  .section { margin-bottom: 24px; }
  .section-title {
    font-size: 9px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #F1F5F9;
  }
  .stat-box {
    flex: 1;
    min-width: 120px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .stat-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .stat-value { font-size: 13px; font-weight: 700; color: #1E3A5F; }
  .movements-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .movements-table thead tr {
    background: #F8FAFC;
  }
  .movements-table th {
    padding: 8px 10px;
    text-align: left;
    font-size: 9px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid #E2E8F0;
  }
  .movements-table tr:last-child td { border-bottom: none; }
  .footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand { font-size: 10px; font-weight: 700; color: #C5A059; letter-spacing: 1px; }
  .footer-date { font-size: 9px; color: #94A3B8; }
  @media print {
    body { padding: 20px; }
    .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- ─── Header ──────────────────────────────────────────────────────────── -->
<div class="header">
  <div>
    <div class="brand">IUE Tracker</div>
    <div class="title">Expediente Judicial</div>
  </div>
  <div class="iue-badge">
    <div class="iue-label">IUE</div>
    <div class="iue-value">${esc(expediente.iue)}</div>
  </div>
</div>

<!-- ─── Carátula ────────────────────────────────────────────────────────── -->
<div class="caratula">${esc(caratula)}</div>

<!-- ─── Metadata ───────────────────────────────────────────────────────── -->
<div class="meta-grid">
  <div class="meta-item">
    <div class="meta-label">Sede</div>
    <div class="meta-value">${esc(expediente.sede)}</div>
  </div>
  <div class="meta-item">
    <div class="meta-label">Año</div>
    <div class="meta-value">${expediente.anio}</div>
  </div>
  <div class="meta-item">
    <div class="meta-label">Nro. Registro</div>
    <div class="meta-value">${expediente.nroRegistro}</div>
  </div>
  <div class="meta-item">
    <div class="meta-label">Última sync</div>
    <div class="meta-value">${formatDate(expediente.lastSyncAt)}</div>
  </div>
</div>

<!-- ─── Stage + Activity ─────────────────────────────────────────────── -->
${stageBadge || activityBadge ? `
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
  ${stageBadge} ${activityBadge}
</div>` : ''}

<!-- ─── Stats ───────────────────────────────────────────────────────────── -->
${statsHtml ? `
<div class="section">
  <div class="section-title">Estadísticas</div>
  ${statsHtml}
</div>` : ''}

<!-- ─── Parties ─────────────────────────────────────────────────────────── -->
${partiesHtml}

<!-- ─── Movements ───────────────────────────────────────────────────────── -->
<div class="section">
  <div class="section-title">Historial de Movimientos (${movements.length})</div>
  <table class="movements-table">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Categoría</th>
        <th>Tipo</th>
        <th>Sede</th>
      </tr>
    </thead>
    <tbody>
      ${movementRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94A3B8;">Sin movimientos registrados</td></tr>'}
    </tbody>
  </table>
</div>

<!-- ─── Notes ───────────────────────────────────────────────────────────── -->
${notesHtml}

<!-- ─── Footer ──────────────────────────────────────────────────────────── -->
<div class="footer">
  <div class="footer-brand">IUE TRACKER</div>
  <div class="footer-date">Generado el ${esc(generatedAt)}</div>
</div>

</body>
</html>`;
}
