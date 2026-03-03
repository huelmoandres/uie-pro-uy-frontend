/**
 * AgendaScripts.ts
 * ─────────────────
 * JavaScript injection scripts for the Agenda Judicial WebView.
 *
 * Architecture pattern:
 *   - Each "step" is a private function returning a plain JS code block (string).
 *   - `buildInjectedScript()` is the composer: it wraps all steps inside a
 *     single IIFE so they share scope (e.g. the `sendToApp` helper).
 *   - To add a new automation step, create a new `buildXxxStep()` function and
 *     add it to the composer. Nothing else needs to change.
 *
 * ⚠️  These strings run in the WEB context, NOT in React Native.
 */

import type { IueData } from '@app-types/agenda.types';

// ─────────────────────────────────────────────────────────────────────────────
// Private step builders (each returns a JS code block, not a full IIFE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * STEP 0 — Bridge helper
 * Defines the `sendToApp(type, payload)` function available to all other steps.
 */
function buildBridgeHelperStep(): string {
    return `
    function sendToApp(type, payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: type, payload: payload, timestamp: Date.now() })
            );
        }
    }`;
}

/**
 * STEP 1 — Auto-fill "Búsqueda de Oficina"
 * Waits for the search field to appear in the DOM (the SPA renders it async)
 * and fills it with "oficina", triggering events so the framework reacts.
 */
function buildAutoFillOficinaStep(): string {
    return `
    (function autoFillOficina() {
        var FIELD_ID = 'W0006W0014vBUSQUEDAOFICINA';
        var attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            var field = document.getElementById(FIELD_ID);
            if (field && !field.value) {
                field.value = 'oficina';
                field.dispatchEvent(new Event('input',   { bubbles: true }));
                field.dispatchEvent(new Event('change',  { bubbles: true }));
                field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                sendToApp('INPUT_FOCUSED', { fieldName: field.name || '', fieldId: FIELD_ID });
                clearInterval(interval);
            }
            if (attempts > 33) clearInterval(interval); // 10s timeout
        }, 300);
    })();`;
}

/**
 * STEP 2 — Auto-select "Oficina de Gestión Centralizada (OFGECEN)"
 * After typing "oficina" in the search field, the site populates a SELECT
 * with matching offices. This step waits for that option to appear and
 * selects it automatically.
 */
function buildSelectOficinaStep(): string {
    return `
    (function autoSelectOfgecen() {
        var SELECT_ID  = 'W0006W0014vOFICINAID';
        var MATCH_TEXT = 'OFGECEN'; // unique substring in the target option
        var attempts   = 0;
        var interval   = setInterval(function() {
            attempts++;
            var select = document.getElementById(SELECT_ID);
            if (select && select.options && select.options.length > 1) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].text.indexOf(MATCH_TEXT) !== -1) {
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('input',  { bubbles: true }));
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        sendToApp('INPUT_FOCUSED', { fieldName: select.name || '', fieldId: SELECT_ID });
                        clearInterval(interval);
                        break;
                    }
                }
            }
            if (attempts > 33) clearInterval(interval); // 10s timeout
        }, 300);
    })();`;
}

/**
 * STEP 3 — Focus tracker
 * Notifies the app whenever an input, select or textarea receives focus.
 * Useful for future smart-fill triggers and UX analytics.
 */
function buildFocusTrackerStep(): string {
    return `
    document.addEventListener('focusin', function(event) {
        var t = event.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) {
            sendToApp('INPUT_FOCUSED', { fieldName: t.name || '', fieldId: t.id || '' });
        }
    }, true);`;
}

/**
 * STEP 3 — Submit listener
 * Notifies the app when a form is submitted so it can close the WebView
 * and show the booking confirmation toast.
 */
function buildSubmitListenerStep(): string {
    return `
    document.addEventListener('submit', function() {
        sendToApp('FORM_SUBMITTED', {
            success: true,
            iue: (window.IUE_DATA && window.IUE_DATA.iue) || '',
            confirmationCode: ''
        });
    }, true);`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public composer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composes all step builders into a single IIFE injected before page load.
 * To add a new step: write a `buildXxxStep()` above and include it here.
 */
export function buildInjectedScript(data: IueData): string {
    const jsonData = JSON.stringify(data);

    return `
(function() {
    'use strict';

    // Expose IUE context to the web page
    window.IUE_DATA = ${jsonData};

    ${buildBridgeHelperStep()}

    ${buildAutoFillOficinaStep()}

    ${buildSelectOficinaStep()}

    ${buildFocusTrackerStep()}

    ${buildSubmitListenerStep()}

    true; // Required by react-native-webview
})();`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-load scripts (injected via injectJavaScript() after the page renders)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional script to pre-fill the IUE field if the web page exposes it
 * after load (call via webViewRef.current?.injectJavaScript(PRE_FILL_IUE_SCRIPT)).
 */
export const PRE_FILL_IUE_SCRIPT = `
(function() {
    if (!window.IUE_DATA) { true; return; }
    var field = document.querySelector('[name="iue"], [id*="iue"], [id*="IUE"]');
    if (field && !field.value) {
        field.value = window.IUE_DATA.iue;
        field.dispatchEvent(new Event('input',  { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }
    true;
})();`.trim();
