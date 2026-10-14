/**
 * CRM Granja La Esperanza — receptor de leads del asistente de la web.
 * Hoja: https://docs.google.com/spreadsheets/d/1MbPSXRbuqpLcPjDQcRk8ILz5MRuSWA-pxj8hgKP_0XM/edit  (pestaña "Leads")
 *
 * PUBLICAR (una sola vez, ~5 min):
 * 1. Abra la hoja "CRM Granja La Esperanza" > menú Extensiones > Apps Script.
 * 2. Borre el contenido de Code.gs, pegue TODO este archivo y guarde (Ctrl+S).
 * 3. Implementar > Nueva implementación > tipo "Aplicación web".
 *      - Descripción: CRM web
 *      - Ejecutar como: Yo (su cuenta)
 *      - Quién tiene acceso: Cualquier usuario   (necesario para que la web pública pueda enviar)
 * 4. Implementar > Autorizar acceso (elija su cuenta > Avanzado > Ir a proyecto > Permitir).
 * 5. Copie la "URL de la aplicación web" (termina en /exec).
 * 6. En script.js del sitio reemplace  const CRM_URL='PEGAR_AQUI_URL_APPS_SCRIPT';
 *    por la URL copiada, haga commit y push. Listo: cada lead entra como fila nueva con Estado "Nuevo".
 * Prueba rápida: abra la URL /exec en el navegador; debe decir "CRM Granja La Esperanza OK".
 * Si cambia este código: Implementar > Gestionar implementaciones > editar > Versión nueva (la URL se mantiene).
 */
const SHEET_ID = '1MbPSXRbuqpLcPjDQcRk8ILz5MRuSWA-pxj8hgKP_0XM';
const TAB = 'Leads';
const MAX = 1000; // máximo de caracteres por campo

function doGet() {
  return ContentService.createTextOutput('CRM Granja La Esperanza OK');
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return out({ ok: true }); // honeypot anti-spam
    const clean = v => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, MAX); // evita fórmulas inyectadas
    if (!clean(d.nombre) || !clean(d.telefono)) return out({ ok: false, error: 'faltan datos' });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB).appendRow([
        new Date(), clean(d.nombre), clean(d.telefono), clean(d.municipio), clean(d.tipo),
        clean(d.interes), clean(d.resumen), clean(d.devolver), clean(d.horario),
        'Nuevo', '', 'Origen: asistente web'
      ]);
    } finally { lock.releaseLock(); }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
