/**
 * AgendaScripts.ts
 * ─────────────────
 * Separation of concerns: all JavaScript strings injected into the WebView
 * live here, away from component logic (ai-rules.md §1, §3).
 *
 * These scripts run in the web context (the agenda website), NOT in React Native.
 */

import type { IueData } from '@app-types/agenda.types';

/**
 * Builds the initialization script injected BEFORE the web content loads.
 * It exposes `window.IUE_DATA` so the agenda web page can pre-fill fields,
 * and sets up `window.ReactNativeWebView.postMessage` listeners for input events.
 */
export function buildInjectedScript(data: IueData): string {
    // Serialize safely — never trust raw string interpolation with user data
    const jsonData = JSON.stringify(data);

    return `
(function() {
    'use strict';

    // 1. Expose IUE data to the web page
    window.IUE_DATA = ${jsonData};

    // 2. Helper: send a typed message back to React Native
    function sendToApp(type, payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: type, payload: payload, timestamp: Date.now() })
            );
        }
    }

    // 3. Notify the app whenever an input gains focus
    document.addEventListener('focusin', function(event) {
        var target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
            sendToApp('INPUT_FOCUSED', {
                fieldName: target.name || '',
                fieldId: target.id || ''
            });
        }
    }, true);

    // 4. Notify the app on detected form submissions
    document.addEventListener('submit', function(event) {
        var form = event.target;
        sendToApp('FORM_SUBMITTED', {
            success: true,
            iue: (window.IUE_DATA && window.IUE_DATA.iue) || '',
            confirmationCode: ''
        });
    }, true);

    true; // Required by react-native-webview
})();
    `.trim();
}

/**
 * Script sent via `injectJavaScript()` (after load) to pre-fill form fields
 * if the web page supports the `IUE_DATA` convention.
 */
export const PRE_FILL_SCRIPT = `
(function() {
    if (window.IUE_DATA) {
        var iueInput = document.querySelector('[name="iue"], [id*="iue"], [id*="IUE"]');
        if (iueInput) {
            iueInput.value = window.IUE_DATA.iue;
            iueInput.dispatchEvent(new Event('input', { bubbles: true }));
            iueInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    true;
})();
`.trim();
