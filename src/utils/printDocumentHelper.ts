// Helper para Impresión Aislada y Descarga Limpia de Comprobantes, Tickets y Presupuestos
// Evita fondos oscuros de modales, bordes de navegador y recortes de página.

export interface PrintableReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  patientName: string;
  species: string;
  breed?: string;
  hc?: string;
  ownerName: string;
  ownerPhone?: string;
  ownerDni?: string;
  reason: string;
  items?: { description: string; quantity: number; unitPrice: number; subtotal: number }[];
  total: number;
  paymentMethod: string;
  vetInCharge: string;
  vetLicense: string;
  notes?: string;
  type?: 'COMPROBANTE' | 'PRESUPUESTO';
  validityDays?: number;
}

export function printThermalTicket(data: PrintableReceiptData) {
  const isEstimate = data.type === 'PRESUPUESTO';
  const title = isEstimate ? 'PRESUPUESTO CLÍNICO' : 'COMPROBANTE DE PAGO';
  const subTitle = isEstimate ? 'VALIDEZ: ' + (data.validityDays || 15) + ' DÍAS' : 'DOCUMENTO NO FISCAL (RECIBO X)';

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.receiptNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 4mm 2mm;
            color: #000;
            background: #fff;
            font-size: 11px;
            line-height: 1.3;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 8px 0;
          }
          .title {
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 2px;
          }
          .subtitle {
            font-size: 10px;
            margin-bottom: 4px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .total-box {
            font-size: 15px;
            font-weight: 900;
            text-align: right;
            padding: 4px 0;
          }
          .qr-placeholder {
            margin: 6px auto;
            text-align: center;
            font-size: 9px;
            padding: 4px;
            border: 1px solid #000;
            display: inline-block;
          }
          .footer {
            font-size: 9px;
            text-align: center;
            margin-top: 8px;
          }
          @media print {
            body { padding: 2mm; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="title">VETERINARIA IRUSTA</div>
          <div class="subtitle">Centro Hospitalario Veterinario</div>
          <div class="subtitle">Río Cuarto, Córdoba • Tel: +54 9 2942 47-7136</div>
          <div class="subtitle">Dr. Diego Irusta • MP 8412</div>
          <div class="divider"></div>
          <div class="bold" style="font-size: 12px;">${title}</div>
          <div style="font-size: 9px;">${subTitle}</div>
          <div class="bold">${data.receiptNumber}</div>
          <div style="font-size: 10px;">Fecha: ${data.date} ${data.time}</div>
        </div>

        <div class="divider"></div>

        <div>
          <div class="row">
            <span>PACIENTE:</span>
            <span class="bold">${data.patientName}</span>
          </div>
          <div class="row" style="font-size: 10px;">
            <span>ESP/RAZA:</span>
            <span>${data.species} ${data.breed ? '· ' + data.breed : ''}</span>
          </div>
          <div class="row" style="font-size: 10px;">
            <span>HIST. CLÍNICA:</span>
            <span>${data.hc || 'HC-2026'}</span>
          </div>
          <div class="row">
            <span>TUTOR:</span>
            <span class="bold">${data.ownerName}</span>
          </div>
          ${data.ownerPhone ? `<div class="row" style="font-size: 10px;"><span>TEL:</span><span>${data.ownerPhone}</span></div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="bold" style="margin-bottom: 4px;">DETALLE DE LA ATENCIÓN:</div>
        <div style="font-size: 11px; margin-bottom: 6px;">${data.reason}</div>

        ${data.items && data.items.length > 0 ? `
          <div class="divider"></div>
          ${data.items.map(item => `
            <div class="row" style="font-size: 10px;">
              <span>${item.quantity}x ${item.description}</span>
              <span class="bold">$${item.subtotal.toLocaleString('es-AR')}</span>
            </div>
          `).join('')}
        ` : ''}

        <div class="double-divider"></div>

        <div class="row total-box">
          <span>TOTAL:</span>
          <span>$${data.total.toLocaleString('es-AR')},00</span>
        </div>

        <div class="row" style="font-size: 10px;">
          <span>MEDIO DE PAGO:</span>
          <span class="bold">${data.paymentMethod}</span>
        </div>
        <div class="row" style="font-size: 10px;">
          <span>ESTADO:</span>
          <span class="bold">${isEstimate ? 'PENDIENTE DE ACEPTACIÓN' : 'PAGO VERIFICADO / ABONADO'}</span>
        </div>

        ${data.notes ? `
          <div class="divider"></div>
          <div style="font-size: 9px;"><strong>Obs:</strong> ${data.notes}</div>
        ` : ''}

        <div class="divider"></div>

        <div class="text-center">
          <div style="font-size: 10px; font-weight: bold;">${data.vetInCharge}</div>
          <div style="font-size: 9px;">Médico Veterinario • ${data.vetLicense}</div>
          <div class="footer">
            ¡Gracias por confiar en Veterinaria Irusta!<br />
            Guardia y Urgencias 24 hs
          </div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 300);
}

export function printA4Document(data: PrintableReceiptData) {
  const isEstimate = data.type === 'PRESUPUESTO';
  const title = isEstimate ? 'PRESUPUESTO CLÍNICO VETERINARIO' : 'COMPROBANTE OFICIAL DE PAGO & RECIBO';
  const subTitle = isEstimate ? 'VALIDEZ DEL PRESUPUESTO: ' + (data.validityDays || 15) + ' DÍAS' : 'COMPROBANTE NO FISCAL — RECIBO X DE ATENCIÓN MÉDICA';

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.receiptNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #0f766e;
            padding-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          .doc-badge {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            padding: 8px 14px;
            border-radius: 8px;
            text-align: right;
          }
          .doc-num {
            font-size: 14px;
            font-weight: 900;
            color: #0f766e;
            font-family: monospace;
          }
          .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            margin-top: 14px;
            margin-bottom: 6px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .card-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .card-row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-size: 11px; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th {
            background: #f1f5f9;
            color: #334155;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            font-weight: 800;
            border-bottom: 1px solid #cbd5e1;
          }
          .table td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 11px;
          }
          .total-container {
            margin-top: 14px;
            display: flex;
            justify-content: flex-end;
          }
          .total-card {
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
            padding: 12px 18px;
            text-align: right;
            min-width: 220px;
          }
          .total-amount {
            font-size: 20px;
            font-weight: 900;
            color: #166534;
            font-family: monospace;
          }
          .footer-sign {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: right;
          }
          .sign-line {
            width: 180px;
            border-bottom: 1px solid #64748b;
            margin-bottom: 4px;
            margin-left: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">VETERINARIA IRUSTA</div>
            <div class="clinic-sub">Centro Hospitalario Veterinario • Guardia 24 Horas</div>
            <div class="clinic-sub">Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136</div>
            <div class="clinic-sub">Dirección Médica: Dr. Diego Irusta • Matrícula Profesional 8412</div>
          </div>
          <div class="doc-badge">
            <div style="font-size: 10px; font-weight: 800; color: #0f766e;">${title}</div>
            <div class="doc-num">${data.receiptNumber}</div>
            <div style="font-size: 10px; color: #64748b;">Fecha: ${data.date} · ${data.time} hs</div>
          </div>
        </div>

        <div class="grid-2" style="margin-top: 12px;">
          <div class="card">
            <div class="section-title" style="margin-top: 0;">🐾 Datos del Paciente</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.patientName}</span></div>
            <div class="card-row"><span class="label">Especie / Raza:</span><span class="value">${data.species} ${data.breed ? '· ' + data.breed : ''}</span></div>
            <div class="card-row"><span class="label">Historia Clínica:</span><span class="value" style="font-family: monospace;">${data.hc || 'HC-2026'}</span></div>
          </div>

          <div class="card">
            <div class="section-title" style="margin-top: 0;">👤 Tutor Responsable</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.ownerName}</span></div>
            <div class="card-row"><span class="label">Teléfono:</span><span class="value">${data.ownerPhone || 'S/D'}</span></div>
            <div class="card-row"><span class="label">Ciudad:</span><span class="value">Río Cuarto, Córdoba</span></div>
          </div>
        </div>

        <div class="section-title">📝 Detalle de Prestaciones Médicas & Medicación</div>
        <div class="card">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${data.reason}</div>
          ${data.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;"><strong>Observaciones:</strong> ${data.notes}</div>` : ''}
        </div>

        ${data.items && data.items.length > 0 ? `
          <table class="table">
            <thead>
              <tr>
                <th>Concepto / Procedimiento</th>
                <th style="text-align: center; width: 60px;">Cant.</th>
                <th style="text-align: right; width: 100px;">Precio Unit.</th>
                <th style="text-align: right; width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td><strong>${item.description}</strong></td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right; font-family: monospace;">$${item.unitPrice.toLocaleString('es-AR')}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">$${item.subtotal.toLocaleString('es-AR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="total-container">
          <div class="total-card">
            <div style="font-size: 11px; font-weight: 800; color: #166534;">${isEstimate ? 'TOTAL PRESUPUESTADO' : 'TOTAL ABONADO'}</div>
            <div class="total-amount">$${data.total.toLocaleString('es-AR')},00</div>
            <div style="font-size: 10px; color: #15803d; font-weight: 600; margin-top: 2px;">
              Medio de Pago: <strong>${data.paymentMethod}</strong> · ${isEstimate ? 'Presupuesto' : 'PAGO VERIFICADO'}
            </div>
          </div>
        </div>

        <div class="footer-sign">
          <div style="font-size: 10px; color: #64748b; max-width: 320px;">
            Documento emitido por el Sistema de Gestión Hospitalaria de <strong>Veterinaria Irusta</strong>.<br />
            ${subTitle}
          </div>
          <div class="signature-box">
            <div class="sign-line"></div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${data.vetInCharge}</div>
            <div style="font-size: 10px; color: #64748b;">Médico Veterinario · ${data.vetLicense}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 300);
}

export function downloadHtmlAsPdf(data: PrintableReceiptData) {
  // Triggers clean A4 print with save-as-PDF prompt without web UI baggage
  printA4Document(data);
}


export interface PrintableClinicalDocumentData {
  title: string;
  type: string;
  patientName: string;
  species: string;
  breed?: string;
  hc?: string;
  ownerName: string;
  ownerDni?: string;
  ownerPhone?: string;
  date: string;
  time?: string;
  content: string;
  vetName: string;
  vetLicense: string;
  isSigned?: boolean;
  signedByOwnerName?: string;
  signedByOwnerDni?: string;
  signedAt?: string;
  signatureDataUrl?: string;
}

export function printA4ClinicalDocument(data: PrintableClinicalDocumentData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Format content paragraphs
  const formattedContent = data.content
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 12px 0; text-align: justify; line-height: 1.6;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.title} - ${data.patientName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 18mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #0f766e;
            padding-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          .doc-badge {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            padding: 8px 14px;
            border-radius: 8px;
            text-align: right;
          }
          .doc-title {
            font-size: 14px;
            font-weight: 900;
            color: #0f766e;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .card-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 11px;
          }
          .card-row:last-child {
            margin-bottom: 0;
          }
          .label {
            color: #64748b;
            font-weight: 600;
          }
          .value {
            color: #0f172a;
            font-weight: 700;
          }
          .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            margin-top: 14px;
            margin-bottom: 6px;
          }
          .content-box {
            background: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px 18px;
            font-size: 12px;
            color: #1e293b;
            margin-bottom: 24px;
          }
          .signatures-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 32px;
            padding-top: 16px;
          }
          .sig-box {
            text-align: center;
            padding-top: 8px;
          }
          .sig-line {
            width: 80%;
            border-top: 1px solid #64748b;
            margin: 0 auto 6px auto;
          }
          .sig-img {
            max-height: 50px;
            max-width: 140px;
            object-fit: contain;
            margin-bottom: 4px;
          }
          .footer-note {
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            margin-top: 24px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">VETERINARIA IRUSTA</div>
            <div class="clinic-sub">Centro Hospitalario Veterinario • Guardia 24 Horas</div>
            <div class="clinic-sub">Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136</div>
            <div class="clinic-sub">Dirección Médica: Dr. Diego Irusta • Matrícula Profesional 8412</div>
          </div>
          <div class="doc-badge">
            <div class="doc-title">${data.title}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Fecha de Emisión: ${data.date} ${data.time ? '· ' + data.time + ' hs' : ''}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="section-title" style="margin-top: 0;">🐾 Datos del Paciente</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.patientName}</span></div>
            <div class="card-row"><span class="label">Especie / Raza:</span><span class="value">${data.species} ${data.breed ? '· ' + data.breed : ''}</span></div>
            <div class="card-row"><span class="label">Historia Clínica:</span><span class="value" style="font-family: monospace;">${data.hc || 'HC-2026'}</span></div>
          </div>

          <div class="card">
            <div class="section-title" style="margin-top: 0;">👤 Tutor Responsable</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.ownerName}</span></div>
            <div class="card-row"><span class="label">DNI / Identificación:</span><span class="value">${data.ownerDni || 'S/D'}</span></div>
            <div class="card-row"><span class="label">Teléfono:</span><span class="value">${data.ownerPhone || 'S/D'}</span></div>
          </div>
        </div>

        <div class="section-title">📄 Declaración & Cláusulas Oficiales</div>
        <div class="content-box">
          ${formattedContent}
        </div>

        <div class="signatures-grid">
          <div class="sig-box">
            ${data.signatureDataUrl ? `<img src="${data.signatureDataUrl}" class="sig-img" alt="Firma Tutor" />` : '<div style="height: 40px;"></div>'}
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.signedByOwnerName || data.ownerName}</div>
            <div style="font-size: 10px; color: #64748b;">Firma del Tutor / Responsable Legal · DNI ${data.signedByOwnerDni || data.ownerDni || 'S/D'}</div>
            ${data.isSigned ? '<div style="font-size: 9px; color: #166534; font-weight: bold; margin-top: 2px;">✓ Firma Digital Verificada</div>' : '<div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Pendiente de Firma</div>'}
          </div>

          <div class="sig-box">
            <div style="height: 40px;"></div>
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.vetName || 'Dr. Diego Irusta'}</div>
            <div style="font-size: 10px; color: #64748b;">Médico Veterinario Actuante · ${data.vetLicense || 'MP 8412'}</div>
            <div style="font-size: 9px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Irusta</div>
          </div>
        </div>

        <div class="footer-note">
          Documento expedido y validado digitalmente por el Sistema Hospitalario de <strong>Veterinaria Irusta</strong>. Válido como instrumento legal y sanitario.
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 300);
}

export function downloadClinicalDocumentPdf(data: PrintableClinicalDocumentData) {
  printA4ClinicalDocument(data);
}
