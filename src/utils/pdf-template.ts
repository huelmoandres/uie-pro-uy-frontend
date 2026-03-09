/**
 * Builds the HTML string used to render the expediente PDF via expo-print.
 * Pure function — no side effects, fully testable.
 */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { stripHtml, formatDate } from './formatters';
import { flattenTimeline } from '@app-types/expediente.types';
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

function categoryDot(category: string): string {
    const map: Record<string, string> = {
        DECREE:       '#1E3A5F',
        NOTIFICATION: '#7C3AED',
        WRITING:      '#0369A1',
        AUDIENCE:     '#B45309',
        INTERNAL:     '#94A3B8',
    };
    return map[category] ?? '#94A3B8';
}

function activityInfo(status: string): { label: string; color: string } {
    const map: Record<string, { label: string; color: string }> = {
        ACTIVE:   { label: 'Activo',       color: '#15803D' },
        ON_TRACK: { label: 'En curso',     color: '#1D4ED8' },
        DELAYED:  { label: 'Demorado',     color: '#B45309' },
        DORMANT:  { label: 'Inactivo',     color: '#64748B' },
        UNKNOWN:  { label: 'Desconocido',  color: '#64748B' },
    };
    return map[status] ?? map.UNKNOWN;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildExpedientePdf(expediente: IExpediente): string {
    const generatedAt = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    const caratula    = stripHtml(expediente.caratula) || 'Sin carátula registrada';
    const movements   = flattenTimeline(expediente.movements);

    // ── Stats ──────────────────────────────────────────────────────────────
    const stats = expediente.stats;
    const statsRow = stats
        ? `
        <div class="stats-grid">
            <div class="stat">
                <span class="stat-n">${expediente.totalMovimientos}</span>
                <span class="stat-l">Total movimientos</span>
            </div>
            <div class="stat">
                <span class="stat-n">${formatDate(stats.firstMovementDate)}</span>
                <span class="stat-l">Primer movimiento</span>
            </div>
            <div class="stat">
                <span class="stat-n">${formatDate(stats.lastMovementDate)}</span>
                <span class="stat-l">Último movimiento</span>
            </div>
            ${stats.averageDaysBetweenMovements != null ? `
            <div class="stat">
                <span class="stat-n">${Math.round(stats.averageDaysBetweenMovements)}d</span>
                <span class="stat-l">Promedio entre mov.</span>
            </div>` : ''}
        </div>`
        : '';

    // ── Parties ────────────────────────────────────────────────────────────
    const p = expediente.parties;
    const partiesBlock = p && (p.plaintiff || p.defendant || p.caseType)
        ? `
        <div class="block">
            <div class="block-title">Partes del Proceso</div>
            <table class="parties-table">
                ${p.plaintiff ? `<tr><td class="pt-label">Actor</td><td class="pt-value">${esc(p.plaintiff)}</td></tr>` : ''}
                ${p.defendant ? `<tr><td class="pt-label">Demandado</td><td class="pt-value">${esc(p.defendant)}</td></tr>` : ''}
                ${p.caseType  ? `<tr><td class="pt-label">Tipo de proceso</td><td class="pt-value">${esc(p.caseType)}</td></tr>` : ''}
            </table>
        </div>`
        : '';

    // ── Stage / Activity badges ────────────────────────────────────────────
    const stageBadge = expediente.stage
        ? `<span class="badge badge-blue">${stageLabel(expediente.stage.stage)}</span>`
        : '';
    const actBadge = expediente.prediction
        ? (() => {
            const a = activityInfo(expediente.prediction.status);
            return `<span class="badge" style="color:${a.color};border-color:${a.color}40;background:${a.color}10;">${a.label}</span>`;
        })()
        : '';

    // ── Movements table rows ───────────────────────────────────────────────
    const rows = movements.map((m, i) => {
        const cat   = m.classification?.type ?? 'INTERNAL';
        const dot   = categoryDot(cat);
        const label = categoryLabel(cat);
        const even  = i % 2 === 0;
        return `
        <tr style="background:${even ? '#FFFFFF' : '#F8FAFC'};">
            <td class="td tc-date">${esc(formatDate(m.fecha))}</td>
            <td class="td tc-cat">
                <span style="display:inline-flex;align-items:center;gap:5px;">
                    <span style="width:6px;height:6px;border-radius:50%;background:${dot};display:inline-block;flex-shrink:0;"></span>
                    ${label}
                </span>
            </td>
            <td class="td tc-tipo">${esc(m.tipo)}</td>
            <td class="td tc-decree">${m.decree?.textoDecreto ? '<span class="decree-yes">&#10003;</span>' : ''}</td>
        </tr>`;
    }).join('');

    // ── Full document ──────────────────────────────────────────────────────
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="color-scheme" content="light">
<style>
  :root { color-scheme: light; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    color: #1E293B;
    background: #fff;
    padding: 44px 48px 36px;
    line-height: 1.5;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .header-left {}
  .brand-line {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #C5A059;
    margin-bottom: 4px;
  }
  .doc-title {
    font-size: 22px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.5px;
  }
  .header-right {
    text-align: right;
  }
  .iue-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 4px;
  }
  .iue-value {
    font-size: 18px;
    font-weight: 800;
    color: #1E3A5F;
    letter-spacing: -0.5px;
  }

  /* ── Divider ── */
  .divider {
    height: 2px;
    background: linear-gradient(90deg, #1E3A5F 0%, #C5A059 60%, #ffffff 100%);
    margin-bottom: 28px;
    border-radius: 2px;
  }

  /* ── Caratula ── */
  .caratula-box {
    border-left: 3px solid #C5A059;
    padding: 10px 16px;
    margin-bottom: 24px;
    background: #FAFBFC;
  }
  .caratula-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 5px;
  }
  .caratula-text {
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
    line-height: 1.5;
  }

  /* ── Metadata grid ── */
  .meta-row {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }
  .meta-cell {
    flex: 1;
    padding: 10px 14px;
    border-right: 1px solid #E2E8F0;
  }
  .meta-cell:last-child { border-right: none; }
  .meta-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 4px;
  }
  .meta-value {
    font-size: 12px;
    font-weight: 700;
    color: #1E293B;
  }

  /* ── Badges ── */
  .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .badge {
    display: inline-block;
    padding: 3px 11px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    border: 1px solid transparent;
  }
  .badge-blue { color: #1D4ED8; border-color: #BFDBFE; background: #EFF6FF; }

  /* ── Stats ── */
  .stats-grid {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .stat {
    flex: 1;
    min-width: 110px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stat-n {
    font-size: 14px;
    font-weight: 800;
    color: #1E3A5F;
  }
  .stat-l {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94A3B8;
  }

  /* ── Generic block ── */
  .block { margin-bottom: 24px; }
  .block-title {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94A3B8;
    padding-bottom: 7px;
    border-bottom: 1px solid #E2E8F0;
    margin-bottom: 12px;
  }

  /* ── Parties table ── */
  .parties-table { width: 100%; border-collapse: collapse; }
  .pt-label {
    padding: 5px 0;
    width: 130px;
    font-size: 10px;
    font-weight: 700;
    color: #64748B;
    vertical-align: top;
  }
  .pt-value {
    padding: 5px 0;
    font-size: 11px;
    color: #1E293B;
    font-weight: 500;
  }

  /* ── Movements table ── */
  .mv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5px;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }
  .mv-table thead tr {
    background: #1E3A5F;
  }
  .th {
    padding: 9px 12px;
    text-align: left;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #FFFFFF;
    white-space: nowrap;
  }
  .td {
    padding: 7px 12px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align: middle;
  }
  .mv-table tr:last-child td { border-bottom: none; }
  .tc-date  { width: 90px;  white-space: nowrap; color: #475569; }
  .tc-cat   { width: 110px; color: #334155; font-weight: 600; }
  .tc-tipo  { color: #334155; }
  .tc-decree { width: 60px; text-align: center; }
  .decree-yes { color: #15803D; font-weight: 700; font-size: 12px; }

  /* ── Footer ── */
  .footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand { font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #C5A059; }
  .footer-meta  { font-size: 9px; color: #94A3B8; text-align: right; }

  @media print {
    body { padding: 20px; }
  }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <div class="brand-line">IUE Tracker &nbsp;·&nbsp; Seguimiento Judicial</div>
    <div class="doc-title">Expediente Judicial</div>
  </div>
  <div class="header-right">
    <div class="iue-label">N.º de Expediente</div>
    <div class="iue-value">${esc(expediente.iue)}</div>
  </div>
</div>

<div class="divider"></div>

<!-- Carátula -->
<div class="caratula-box">
  <div class="caratula-label">Carátula</div>
  <div class="caratula-text">${esc(caratula)}</div>
</div>

<!-- Metadata -->
<div class="meta-row">
  <div class="meta-cell">
    <div class="meta-label">Sede</div>
    <div class="meta-value">${esc(expediente.sede)}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Año</div>
    <div class="meta-value">${expediente.anio}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Nro. Registro</div>
    <div class="meta-value">${expediente.nroRegistro}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Última actualización</div>
    <div class="meta-value">${formatDate(expediente.lastSyncAt)}</div>
  </div>
</div>

<!-- Badges -->
${stageBadge || actBadge ? `
<div class="badges">
  ${stageBadge}${actBadge}
</div>` : ''}

<!-- Stats -->
${statsRow ? `
<div class="block">
  <div class="block-title">Estadísticas del Expediente</div>
  ${statsRow}
</div>` : ''}

<!-- Parties -->
${partiesBlock}

<!-- Movements -->
<div class="block">
  <div class="block-title">Historial de Movimientos &nbsp;(${movements.length})</div>
  <table class="mv-table">
    <thead>
      <tr>
        <th class="th">Fecha</th>
        <th class="th">Categoría</th>
        <th class="th">Tipo de movimiento</th>
        <th class="th" style="text-align:center;">Decreto</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td class="td" colspan="4" style="text-align:center;color:#94A3B8;padding:20px;">Sin movimientos registrados</td></tr>`}
    </tbody>
  </table>
</div>

<!-- Footer -->
<div class="footer">
  <div class="footer-brand">IUE TRACKER</div>
  <div class="footer-meta">
    Generado el ${esc(generatedAt)}<br/>
    Documento de uso interno — no constituye copia oficial
  </div>
</div>

</body>
</html>`;
}
