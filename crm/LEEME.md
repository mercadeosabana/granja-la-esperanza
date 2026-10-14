# CRM del asistente "Hablar con la granja"
- Hoja: https://docs.google.com/spreadsheets/d/1MbPSXRbuqpLcPjDQcRk8ILz5MRuSWA-pxj8hgKP_0XM/edit (pestaña Leads)
- Receptor: `apps-script.gs` (instrucciones de publicación al inicio del archivo).
- Conexión: en `script.js` cambie `CRM_URL` por la URL `/exec` de la aplicación web.
- Mientras `CRM_URL` no esté configurada (o si falla el envío), el asistente guarda el lead en el navegador del visitante (localStorage `granja_leads`) y le ofrece enviar el resumen por WhatsApp al número configurado en `WHATSAPP`.
