
export function triggerIframePrint(html: string) {
  if (typeof document === 'undefined') return;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Direct popup fallback
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        printWin.print();
      }
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    let hasPrinted = false;
    const handlePrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Error triggering iframe print:', e);
        try {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
        } catch (err) {
          console.error('Fallback window.open failed:', err);
        }
      }
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch {}
      }, 60000);
    };

    if (iframe.contentWindow) {
      iframe.contentWindow.onload = handlePrint;
    }
    setTimeout(handlePrint, 400);
  } catch (err) {
    console.error('Fatal print error, using direct window fallback:', err);
    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        printWin.print();
      }
    } catch {}
  }
}

export function normalizeDoctorProfessional(authorName?: string, authorLicense?: string): { name: string; license: string } {
  const nameStr = (authorName || '').trim();
  const licStr = (authorLicense || '').trim();
  const isIrusta = !nameStr || nameStr.toLowerCase().includes('irusta') || nameStr.toLowerCase().includes('diego');

  if (isIrusta) {
    return {
      name: 'Dr. Diego Iván Irusta',
      license: 'M.P. 502 - Dirección Médica',
    };
  }

  const isFakeLicense = !licStr || licStr.includes('8412') || licStr.includes('7841') || licStr.includes('MP-VET') || licStr.includes('MP-');
  return {
    name: nameStr || 'Dr. Diego Iván Irusta',
    license: isFakeLicense ? 'M.P. 502 - Dirección Médica' : licStr,
  };
}
// Helper para Impresión Aislada y Descarga Limpia de Comprobantes, Tickets y Presupuestos
// Evita fondos oscuros de modales, bordes de navegador y recortes de página.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
          <img src="/logo-ranquel.png" style="width: 42px; height: 42px; object-fit: contain; margin-bottom: 4px;" alt="Logo" /><br />
          <div class="title">VETERINARIA RANQUEL</div>
          <div class="subtitle">Centro Hospitalario Veterinario</div>
          <div class="subtitle">Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel: +54 9 2942 47-7136</div>
          <div class="subtitle">Dr. Diego Iván Irusta • M.P. 502</div>
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
            ¡Gracias por confiar en Veterinaria Ranquel!<br />
            Guardia y Urgencias 24 hs
          </div>
        </div>
      </body>
    </html>
  `;

  triggerIframePrint(html);
}

export function printA4Document(data: PrintableReceiptData) {
  const isEstimate = data.type === 'PRESUPUESTO';
  const title = isEstimate ? 'PRESUPUESTO CLÍNICO OFICIAL' : 'COMPROBANTE OFICIAL DE PAGO & RECIBO';
  const subTitle = isEstimate ? 'VALIDEZ DEL PRESUPUESTO: ' + (data.validityDays || 15) + ' DÍAS' : 'COMPROBANTE NO FISCAL — RECIBO X DE ATENCIÓN MÉDICA';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - ${data.receiptNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11.5px;
            line-height: 1.45;
          }
          .header {
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand-box {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .logo-img {
            width: 58px;
            height: 58px;
            object-fit: contain;
            border-radius: 12px;
            border: 1.5px solid #0f766e;
            background: #ffffff;
            padding: 2px;
          }
          .clinic-name {
            font-size: 17px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.3px;
            line-height: 1.1;
          }
          .clinic-sub {
            font-size: 10.5px;
            color: #475569;
            font-weight: 600;
            margin-top: 2px;
          }
          .doc-badge {
            background: #f0fdfa;
            border: 1.5px solid #99f6e4;
            padding: 8px 14px;
            border-radius: 10px;
            text-align: right;
            min-width: 170px;
          }
          .doc-title {
            font-size: 11px;
            font-weight: 900;
            color: #0f766e;
            text-transform: uppercase;
          }
          .doc-num {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            font-family: monospace;
            margin: 2px 0;
          }
          .doc-date {
            font-size: 9.5px;
            color: #64748b;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
          }
          .section-title {
            font-size: 10.5px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: #0f766e;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
            margin-bottom: 6px;
          }
          .card-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 11px;
          }
          .card-row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 12px;
          }
          .table th {
            background: #0f766e;
            color: #ffffff;
            text-align: left;
            padding: 7px 10px;
            font-size: 10.5px;
            font-weight: 800;
            border-radius: 0;
          }
          .table td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          .table tr:nth-child(even) td {
            background: #f8fafc;
          }
          .total-container {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
          }
          .total-card {
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 10px;
            padding: 10px 16px;
            text-align: right;
            min-width: 220px;
          }
          .total-label {
            font-size: 10.5px;
            font-weight: 800;
            color: #166534;
          }
          .total-amount {
            font-size: 19px;
            font-weight: 900;
            color: #166534;
            font-family: monospace;
          }
          .total-sub {
            font-size: 9.5px;
            color: #15803d;
            font-weight: 600;
            margin-top: 2px;
          }
          .footer-sign {
            margin-top: 26px;
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
            width: 170px;
            border-bottom: 1px solid #64748b;
            margin-bottom: 4px;
            margin-left: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-box">
            <img src="/logo-ranquel.png" class="logo-img" alt="Logo Ranquel" />
            <div>
              <div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
              <div class="clinic-sub">Centro Hospitalario Veterinario • Cuidados Críticos 24 Horas</div>
              <div class="clinic-sub">Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel/WhatsApp: +54 9 2942 47-7136</div>
              <div class="clinic-sub">Dirección Médica: Dr. Diego Iván Irusta • Matrícula Profesional 502</div>
            </div>
          </div>
          <div class="doc-badge">
            <div class="doc-title">${title}</div>
            <div class="doc-num">${data.receiptNumber}</div>
            <div class="doc-date">Fecha: ${data.date} · ${data.time} hs</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="section-title">DATOS DEL PACIENTE</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.patientName}</span></div>
            <div class="card-row"><span class="label">Especie / Raza:</span><span class="value">${data.species} ${data.breed ? '· ' + data.breed : ''}</span></div>
            <div class="card-row"><span class="label">Historia Clínica:</span><span class="value" style="font-family: monospace;">${data.hc || 'HC-2026'}</span></div>
          </div>

          <div class="card">
            <div class="section-title">TUTOR RESPONSABLE</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.ownerName}</span></div>
            <div class="card-row"><span class="label">Teléfono:</span><span class="value">${data.ownerPhone || 'S/D'}</span></div>
            <div class="card-row"><span class="label">Localidad:</span><span class="value">Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</span></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 10px;">
          <div class="section-title">${isEstimate ? 'CONCEPTO DEL PRESUPUESTO' : 'MOTIVO DE CONSULTA / PRESTACIÓN'}</div>
          <div style="font-size: 11.5px; font-weight: 700; color: #0f172a;">${data.reason}</div>
          ${data.notes ? `<div style="font-size: 10.5px; color: #64748b; margin-top: 4px;"><strong>Observaciones:</strong> ${data.notes}</div>` : ''}
        </div>

        ${data.items && data.items.length > 0 ? `
          <table class="table">
            <thead>
              <tr>
                <th>Concepto / Prestación</th>
                <th style="text-align: center; width: 60px;">Cant.</th>
                <th style="text-align: right; width: 110px;">Precio Unit.</th>
                <th style="text-align: right; width: 110px;">Subtotal</th>
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
            <div class="total-label">${isEstimate ? 'TOTAL PRESUPUESTADO' : 'TOTAL ABONADO'}</div>
            <div class="total-amount">$${data.total.toLocaleString('es-AR')},00</div>
            <div class="total-sub">
              Medio de Pago: <strong>${data.paymentMethod}</strong> · ${isEstimate ? 'Presupuesto Oficial' : 'PAGO VERIFICADO'}
            </div>
          </div>
        </div>

        <div class="footer-sign">
          <div style="font-size: 9.5px; color: #64748b; max-width: 330px; line-height: 1.35;">
            Documento emitido por el Sistema de Gestión Hospitalaria de <strong>Veterinaria Ranquel</strong>.<br />
            ${subTitle}
          </div>
          <div class="signature-box">
            <div class="sign-line"></div>
            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${data.vetInCharge}</div>
            <div style="font-size: 10px; color: #64748b;">Médico Veterinario · ${data.vetLicense}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #0f766e;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>
      </body>
    </html>
  `;

  triggerIframePrint(html);
}

export function generateReceiptPdfDocument(data: PrintableReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isEstimate = data.type === 'PRESUPUESTO';
  const title = isEstimate ? 'PRESUPUESTO CLÍNICO OFICIAL' : 'COMPROBANTE OFICIAL DE PAGO & RECIBO';
  const subtitle = isEstimate
    ? `VALIDEZ DEL PRESUPUESTO: ${data.validityDays || 15} DÍAS`
    : 'COMPROBANTE NO FISCAL — RECIBO X DE ATENCIÓN MÉDICA';

  // Institutional Header Banner
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CLÍNICA VETERINARIA RANQUEL', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(204, 251, 241);
  doc.text('Grandes y Pequeños Animales • Cuidados Críticos & Cirugía 24 Hs • Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)', 14, 16);
  doc.text('Dirección Médica: Dr. Diego Iván Irusta — Matrícula Profesional: M.P. 502', 14, 21);

  // Document Badge Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 196, 11, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.receiptNumber} • ${data.date} ${data.time}`, 196, 17, { align: 'right' });

  // Patient & Owner Info Box
  autoTable(doc, {
    startY: 28,
    margin: { left: 14, right: 14 },
    head: [['DATOS DEL PACIENTE', 'DATOS DEL TUTOR TITULAR']],
    body: [
      [
        `Paciente: ${data.patientName}\nEspecie/Raza: ${data.species} ${data.breed ? '• ' + data.breed : ''}\nHistoria Clínica: ${data.hc || 'HC-2026'}`,
        `Tutor: ${data.ownerName}\nTeléfono: ${data.ownerPhone || 'S/D'}\nLocalidad: Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)\nVeterinario a Cargo: Dr. Diego Iván Irusta (M.P. 502)`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, cellPadding: 3 },
  });

  // Services / Items Breakdown Table
  let currentY = (doc as any).lastAutoTable.finalY + 4;

  const itemsBody = data.items && data.items.length > 0
    ? data.items.map((it) => [
        it.description,
        String(it.quantity),
        `$ ${it.unitPrice.toLocaleString('es-AR')}`,
        `$ ${it.subtotal.toLocaleString('es-AR')}`,
      ])
    : [
        [
          data.reason,
          '1',
          `$ ${data.total.toLocaleString('es-AR')}`,
          `$ ${data.total.toLocaleString('es-AR')}`,
        ],
      ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    head: [['DETALLE DE PRESTACIONES & MEDICACIÓN', 'CANT.', 'PRECIO UNIT.', 'SUBTOTAL']],
    body: itemsBody,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 31], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
    },
  });

  // Total Summary & Signatures
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Total Card Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(120, currentY, 76, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text(isEstimate ? 'TOTAL PRESUPUESTADO:' : 'TOTAL ABONADO:', 124, currentY + 6);

  doc.setFontSize(13);
  doc.setTextColor(22, 101, 52);
  doc.text(`$ ${data.total.toLocaleString('es-AR')},00`, 192, currentY + 14, { align: 'right' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text(`Medio de Pago: ${data.paymentMethod} • PAGO VERIFICADO`, 124, currentY + 19);

  // Signatures
  currentY += 32;

  doc.setDrawColor(100, 116, 139);
  // Left: Tutor
  doc.line(25, currentY + 12, 85, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(data.ownerName || 'Tutor Responsable', 55, currentY + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma del Tutor Titular', 55, currentY + 21, { align: 'center' });

  // Right: Doctor
  doc.line(125, currentY + 12, 185, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Diego Iván Irusta', 155, currentY + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Médico Veterinario • M.P. 502', 155, currentY + 21, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Dirección Médica • Veterinaria Ranquel', 155, currentY + 25, { align: 'center' });

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Comprobante emitido por el Sistema Hospitalario de Veterinaria Ranquel (Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)) • Tel/WhatsApp +54 9 2942 47-7136',
    14,
    286
  );

  return doc;
}

export async function downloadReceiptPdf(data: PrintableReceiptData, customFileName?: string): Promise<boolean> {
  try {
    const doc = generateReceiptPdfDocument(data);
    const petName = (data.patientName || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
    const recNum = (data.receiptNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = customFileName || `${data.type === 'PRESUPUESTO' ? 'Presupuesto_Oficial' : 'Comprobante_Pago'}_${recNum}_${petName}.pdf`;

    // Clean direct save without duplicate click events
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Error in downloadReceiptPdf:', err);
    // Fallback: try blob download
    try {
      const doc = generateReceiptPdfDocument(data);
      const petName = (data.patientName || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
      const recNum = (data.receiptNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = customFileName || `${data.type === 'PRESUPUESTO' ? 'Presupuesto_Oficial' : 'Comprobante_Pago'}_${recNum}_${petName}.pdf`;
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      return true;
    } catch (e2) {
      console.error('Blob fallback failed:', e2);
      printA4Document(data);
      return false;
    }
  }
}


export async function downloadHtmlAsPdf(data: PrintableReceiptData): Promise<boolean> {
  return downloadReceiptPdf(data);
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
            <div class="clinic-name">VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Centro Hospitalario Veterinario • Guardia 24 Horas</div>
            <div class="clinic-sub">Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel/WhatsApp: +54 9 2942 47-7136</div>
            <div class="clinic-sub">Dirección Médica: Dr. Diego Iván Irusta • Matrícula Profesional 502</div>
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
            <div style="font-weight: 800; font-size: 11px;">${data.vetName || 'Dr. Diego Iván Irusta'}</div>
            <div style="font-size: 10px; color: #64748b;">Médico Veterinario Actuante · ${data.vetLicense || 'M.P. 502'}</div>
            <div style="font-size: 9px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Documento expedido y validado digitalmente por el Sistema Hospitalario de <strong>Veterinaria Ranquel</strong>. Válido como instrumento legal y sanitario.
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


export function generateClinicalDocumentPdf(data: PrintableClinicalDocumentData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CLÍNICA VETERINARIA RANQUEL', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(204, 251, 241);
  doc.text('Grandes y Pequeños Animales • Cuidados Críticos & Cirugía 24 Hs • Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)', 14, 16);
  doc.text('Dirección Médica: Dr. Diego Iván Irusta — Matrícula Profesional: M.P. 502', 14, 21);

  // Document Title Badge Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(data.title.toUpperCase(), 196, 11, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${data.date} ${data.time || ''}`, 196, 17, { align: 'right' });

  // Patient & Owner Info Box
  autoTable(doc, {
    startY: 28,
    margin: { left: 14, right: 14 },
    head: [['DATOS DEL PACIENTE', 'DATOS DEL TUTOR TITULAR']],
    body: [
      [
        `Paciente: ${data.patientName}\nEspecie/Raza: ${data.species} ${data.breed ? '• ' + data.breed : ''}\nHistoria Clínica: ${data.hc || 'HC-2026'}`,
        `Tutor: ${data.ownerName}\nDNI: ${data.ownerDni || 'No registrado'}\nTeléfono: ${data.ownerPhone || 'S/D'}\nVeterinario a Cargo: Dr. Diego Iván Irusta (M.P. 502)`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, cellPadding: 3 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // Document Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.title, 14, currentY);

  currentY += 6;

  // Document Body Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const cleanContent = data.content.replace(/<[^>]+>/g, '');
  const splitText = doc.splitTextToSize(cleanContent, 182);
  doc.text(splitText, 14, currentY);

  currentY += splitText.length * 4.5 + 12;

  if (currentY > 230) {
    doc.addPage();
    currentY = 30;
  }

  // Legal Disclaimer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DECLARACIÓN Y CONFORMIDAD:', 18, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'El tutor declara haber sido informado verbalmente y por escrito de los riesgos, beneficios y alternativas terapéuticas, autorizando libremente las prácticas médicas descriptas.',
    18,
    currentY + 10,
    { maxWidth: 174 }
  );

  currentY += 28;

  // Signatures
  doc.setDrawColor(100, 116, 139);

  // Left Signature: Tutor
  doc.line(25, currentY + 14, 85, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(data.isSigned ? (data.signedByOwnerName || data.ownerName) : data.ownerName, 55, currentY + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Firma del Tutor (DNI ${data.ownerDni || '___'})`, 55, currentY + 23, { align: 'center' });
  if (data.isSigned) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text(`[FIRMADO DIGITALMENTE ${data.signedAt || ''}]`, 55, currentY + 27, { align: 'center' });
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text('(Firma en papel / Manuscrita)', 55, currentY + 27, { align: 'center' });
  }

  // Right Signature: Doctor
  doc.line(125, currentY + 14, 185, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Diego Iván Irusta', 155, currentY + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Médico Veterinario • M.P. 502', 155, currentY + 23, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Dirección Médica • Veterinaria Ranquel', 155, currentY + 27, { align: 'center' });

  // Footer Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Documento legal emitido por el Sistema Hospitalario de Veterinaria Ranquel (Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)) • Tel/WhatsApp +54 9 2942 47-7136',
    14,
    286
  );

  return doc;
}

export async function downloadClinicalDocumentPdf(data: PrintableClinicalDocumentData, customFileName?: string): Promise<boolean> {
  try {
    const doc = generateClinicalDocumentPdf(data);
    const petName = (data.patientName || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
    const docTitle = (data.title || 'Consentimiento').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = customFileName || `${docTitle}_${petName}.pdf`;

    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Error in downloadClinicalDocumentPdf:', err);
    printA4ClinicalDocument(data);
    return false;
  }
}



// ==========================================
// HISTORIA CLÍNICA COMPLETA A4 & PDF
// ==========================================

export interface PrintableMedicalHistoryData {
  patient: {
    name: string;
    species: string;
    breed?: string;
    sex?: string;
    age?: string;
    weight?: number;
    color?: string;
    microchip?: string;
    hc?: string;
    status?: string;
  };
  owner?: {
    name: string;
    phone?: string;
    dni?: string;
    address?: string;
    balance?: number;
  };
  doctor: {
    name: string;
    license: string;
  };
  emissionDate?: string;
  emissionTime?: string;
  hospitalizations?: {
    kennelNumber?: string;
    sector?: string;
    admittedAt: string;
    dischargedAt?: string;
    daysCount: string;
    primaryDiagnosis?: string;
    dischargeSummary?: string;
    status: string;
  }[];
  vitals?: {
    date: string;
    dayOfWeek: string;
    time: string;
    temp?: number | string;
    hr?: number | string;
    rr?: number | string;
    bp?: string;
    spo2Glucose?: string;
    pain?: number | string;
    recordedBy?: string;
  }[];
  evolutions?: {
    date: string;
    dayOfWeek: string;
    time: string;
    author: string;
    license?: string;
    type?: string;
    content: string;
  }[];
  medications?: {
    date: string;
    dayOfWeek: string;
    time: string;
    drugName: string;
    dose: string;
    route: string;
    administeredBy: string;
    notes?: string;
  }[];
  studies?: {
    type: 'LABORATORIO' | 'IMAGEN' | 'CIRUGIA';
    date: string;
    title: string;
    subtitle?: string;
    details: string;
  }[];
  financials?: {
    items: {
      description: string;
      category: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
    totalSpent: number;
    totalPaid: number;
    balanceDue: number;
  };
}

export function printA4MedicalHistory(data: PrintableMedicalHistoryData) {
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

  const now = new Date();
  const emDate = data.emissionDate || now.toLocaleDateString('es-AR');
  const emTime = data.emissionTime || now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Historia_Clinica_${data.patient.name}_${data.patient.hc || 'HC'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1e293b;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.35;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 10px;
            color: #64748b;
            margin-top: 1px;
          }
          .doc-badge {
            text-align: right;
          }
          .doc-title {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 14px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .section-title {
            font-size: 11px;
            font-weight: 900;
            color: #0f766e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .card-row {
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
            margin-bottom: 3px;
          }
          .label {
            color: #64748b;
            font-weight: 600;
          }
          .value {
            font-weight: 700;
            color: #0f172a;
          }
          .block-section {
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .block-title {
            font-size: 11.5px;
            font-weight: 900;
            color: #0f766e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 6px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 800;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
          }
          td {
            padding: 4px 6px;
            border: 1px solid #e2e8f0;
            color: #1e293b;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .evo-box {
            background: #f8fafc;
            border-left: 3px solid #0f766e;
            padding: 6px 10px;
            margin-bottom: 6px;
            border-radius: 0 6px 6px 0;
            border-top: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
            border-bottom: 1px solid #f1f5f9;
          }
          .evo-meta {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f766e;
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .evo-body {
            font-size: 10.5px;
            color: #1e293b;
            white-space: pre-line;
          }
          .financial-summary {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 6px;
            font-size: 11px;
            font-weight: 800;
          }
          .financial-badge {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 4px 8px;
            border-radius: 6px;
          }
          .signatures-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 20px;
            padding-top: 10px;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
          }
          .sig-line {
            width: 70%;
            border-top: 1px solid #64748b;
            margin: 30px auto 4px auto;
          }
          .footer-note {
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Grandes y Pequeños Animales • Cuidados Críticos & Cirugía 24 Hs</div>
            <div class="clinic-sub">Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel/WhatsApp: +54 9 2942 47-7136</div>
            <div class="clinic-sub">Dirección Médica: <strong>${data.doctor.name}</strong> — Matrícula Profesional: <strong>${data.doctor.license}</strong></div>
          </div>
          <div class="doc-badge">
            <div class="doc-title">Historia Clínica Integral</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Emisión: ${emDate} ${emTime} hs</div>
            <div style="font-size: 9.5px; font-weight: bold; color: #0f766e; margin-top: 2px;">Estado: ${data.patient.status || 'ACTIVO'}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="section-title">🐾 Datos del Paciente</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.patient.name}</span></div>
            <div class="card-row"><span class="label">Especie / Raza:</span><span class="value">${data.patient.species} ${data.patient.breed ? '• ' + data.patient.breed : ''}</span></div>
            <div class="card-row"><span class="label">Sexo / Edad:</span><span class="value">${data.patient.sex || 'S/D'} • ${data.patient.age || 'No reg.'}</span></div>
            <div class="card-row"><span class="label">Peso Actual:</span><span class="value">${data.patient.weight ? data.patient.weight + ' kg' : 'S/D'}</span></div>
            <div class="card-row"><span class="label">Pelaje / Color:</span><span class="value">${data.patient.color || 'No reg.'}</span></div>
            <div class="card-row"><span class="label">Microchip ISO:</span><span class="value" style="font-family: monospace;">${data.patient.microchip || 'Sin chip'}</span></div>
            <div class="card-row"><span class="label">N° Ficha Clínica:</span><span class="value" style="font-family: monospace;">${data.patient.hc || 'HC-2026'}</span></div>
          </div>

          <div class="card">
            <div class="section-title">👤 Datos del Tutor Titular</div>
            <div class="card-row"><span class="label">Nombre:</span><span class="value">${data.owner?.name || 'Sin tutor registrado'}</span></div>
            <div class="card-row"><span class="label">Teléfono / WhatsApp:</span><span class="value">${data.owner?.phone || 'S/D'}</span></div>
            <div class="card-row"><span class="label">DNI / CUIT:</span><span class="value">${data.owner?.dni || 'S/D'}</span></div>
            <div class="card-row"><span class="label">Dirección:</span><span class="value">${data.owner?.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'}</span></div>
            <div class="card-row"><span class="label">Cuenta Corriente:</span><span class="value">${data.owner?.balance !== undefined ? '$ ' + Number(data.owner.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '$ 0,00'}</span></div>
            <div class="card-row"><span class="label">Veterinario a Cargo:</span><span class="value">${data.doctor.name} (${data.doctor.license})</span></div>
          </div>
        </div>

        ${data.hospitalizations && data.hospitalizations.length > 0 ? `
        <div class="block-section">
          <div class="block-title">1. Registro de Internación & Días en Hospital</div>
          ${data.hospitalizations.map(h => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                <span>Box / Canil: ${h.kennelNumber || '01'} (${h.sector || 'GENERAL'})</span>
                <span style="color: #0f766e;">${h.status} — ${h.daysCount}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; color: #475569;">
                <div><strong>Ingreso:</strong> ${h.admittedAt}</div>
                <div><strong>Egreso:</strong> ${h.dischargedAt || 'En curso'}</div>
              </div>
              ${h.primaryDiagnosis ? `<div style="font-size: 10px; margin-top: 3px;"><strong>Diagnóstico Principal:</strong> ${h.primaryDiagnosis}</div>` : ''}
              ${h.dischargeSummary ? `<div style="font-size: 10px; margin-top: 3px; background: #ecfdf5; padding: 4px 6px; border-radius: 4px; color: #065f46;"><strong>Epicrisis:</strong> ${h.dischargeSummary}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.vitals && data.vitals.length > 0 ? `
        <div class="block-section">
          <div class="block-title">2. Controles de Signos Vitales Multiparamétricos</div>
          <table>
            <thead>
              <tr>
                <th>Día / Fecha y Hora</th>
                <th>Temp (°C)</th>
                <th>FC (lpm)</th>
                <th>FR (rpm)</th>
                <th>P. Arterial</th>
                <th>SpO2 / Glucosa</th>
                <th>Dolor</th>
                <th>Profesional</th>
              </tr>
            </thead>
            <tbody>
              ${data.vitals.map(v => `
                <tr>
                  <td style="font-weight: 700;">${v.dayOfWeek} ${v.date} ${v.time}</td>
                  <td>${v.temp || '-'}</td>
                  <td>${v.hr || '-'}</td>
                  <td>${v.rr || '-'}</td>
                  <td>${v.bp || '-'}</td>
                  <td>${v.spo2Glucose || '-'}</td>
                  <td>${v.pain !== undefined ? v.pain + '/10' : '-'}</td>
                  <td>${v.recordedBy || data.doctor.name}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.evolutions && data.evolutions.length > 0 ? `
        <div class="block-section">
          <div class="block-title">3. Evolución Médica & Notas Clínicas</div>
          ${data.evolutions.map(e => {
            const norm = normalizeDoctorProfessional(e.author, e.license);
            const formattedContent = (e.content || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `
            <div class="evo-box">
              <div class="evo-meta">
                <span>Evolución (${e.type || 'Médica'}) — ${e.dayOfWeek} ${e.date} ${e.time} hs</span>
                <span>${norm.name} (${norm.license})</span>
              </div>
              <div class="evo-body">${formattedContent}</div>
            </div>
            `;
          }).join('')}
        </div>
        ` : ''}

        ${data.medications && data.medications.length > 0 ? `
        <div class="block-section">
          <div class="block-title">4. Medicación & Tratamientos Administrados</div>
          <table>
            <thead>
              <tr>
                <th>Día / Fecha</th>
                <th>Hora</th>
                <th>Fármaco / Principio Activo</th>
                <th>Dosis</th>
                <th>Vía</th>
                <th>Administrado Por</th>
              </tr>
            </thead>
            <tbody>
              ${data.medications.map(m => `
                <tr>
                  <td>${m.dayOfWeek} ${m.date}</td>
                  <td style="font-weight: 700;">${m.time} hs</td>
                  <td style="font-weight: 700; color: #0f172a;">${m.drugName}</td>
                  <td>${m.dose}</td>
                  <td><span style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-weight: bold;">${m.route}</span></td>
                  <td>${m.administeredBy}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.studies && data.studies.length > 0 ? `
        <div class="block-section">
          <div class="block-title">5. Estudios Complementarios, Laboratorios & Procedimientos</div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estudio / Procedimiento</th>
                <th>Detalle & Conclusiones</th>
              </tr>
            </thead>
            <tbody>
              ${data.studies.map(s => `
                <tr>
                  <td>${s.date}</td>
                  <td><span style="font-weight: bold; color: #0f766e;">${s.type}</span></td>
                  <td style="font-weight: 700;">${s.title}</td>
                  <td>${s.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.financials && data.financials.items && data.financials.items.length > 0 ? `
        <div class="block-section">
          <div class="block-title">6. Presupuesto & Liquidación Total de Insumos y Gastos</div>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción del Insumo / Servicio</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">P. Unitario</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${data.financials.items.map(it => `
                <tr>
                  <td><span style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-weight: 600;">${it.category}</span></td>
                  <td style="font-weight: 600;">${it.description}</td>
                  <td style="text-align: center; font-weight: bold;">${it.quantity}</td>
                  <td style="text-align: right;">$ ${Number(it.unitPrice).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td style="text-align: right; font-weight: bold;">$ ${Number(it.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="financial-summary">
            <div class="financial-badge">Total Gastado / Incurrido: <strong>$ ${Number(data.financials.totalSpent).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></div>
            <div class="financial-badge" style="color: #166534;">Total Abonado: <strong>$ ${Number(data.financials.totalPaid).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></div>
            <div class="financial-badge" style="${data.financials.balanceDue > 0 ? 'color: #991b1b; background: #fef2f2; border-color: #fecaca;' : 'color: #166534;'}">
              Saldo Pendiente: <strong>$ ${Number(data.financials.balanceDue).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="signatures-grid">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.owner?.name || 'Tutor Responsable'}</div>
            <div style="font-size: 9.5px; color: #64748b;">Firma del Tutor / Titular · DNI ${data.owner?.dni || 'S/D'}</div>
          </div>

          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.doctor.name}</div>
            <div style="font-size: 9.5px; color: #64748b;">Médico Veterinario · ${data.doctor.license}</div>
            <div style="font-size: 9px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Historia clínica expedida bajo secreto médico y normas de ejercicio profesional del Colegio Médico Veterinario. Documento oficial auditado con firma digital.
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

export function generateMedicalHistoryPdfDocument(data: PrintableMedicalHistoryData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const emDate = data.emissionDate || new Date().toLocaleDateString('es-AR');
  const emTime = data.emissionTime || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // 1. Top Decorative Bar & Header
  doc.setFillColor(15, 118, 110);
  doc.rect(14, 10, 182, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(22, 43, 29);
  doc.text('CLÍNICA VETERINARIA RANQUEL', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Grandes y Pequeños Animales • Cuidados Críticos & Cirugía 24 Hs', 14, 23);
  doc.text('Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel/WhatsApp: +54 9 2942 47-7136', 14, 27);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Dirección Médica: ${data.doctor.name} — Matrícula Profesional: ${data.doctor.license}`, 14, 31);

  // Right Badge Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(132, 13, 64, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('HISTORIA CLÍNICA OFICIAL', 135, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emisión: ${emDate} ${emTime} hs`, 135, 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Estado Clínico: ${data.patient.status || 'ACTIVO'}`, 135, 29);

  // 2. Patient & Owner Summary Table
  const patientDetails = [
    `Nombre: ${data.patient.name}`,
    `Especie / Raza: ${data.patient.species} • ${data.patient.breed || 'Mestizo'}`,
    `Sexo / Edad: ${data.patient.sex || 'S/D'} • ${data.patient.age || 'No reg.'}`,
    `Peso Actual: ${data.patient.weight ? data.patient.weight + ' kg' : 'S/D'}`,
    `Pelaje / Color: ${data.patient.color || 'No reg.'}`,
    `Microchip ISO: ${data.patient.microchip || 'Sin chip'}`,
    `N° Ficha Clínica: ${data.patient.hc || 'HC-2026'}`,
  ].join('\n');

  const ownerDetails = [
    `Nombre: ${data.owner?.name || 'Sin tutor asignado'}`,
    `Teléfono / WhatsApp: ${data.owner?.phone || 'S/D'}`,
    `DNI / CUIT: ${data.owner?.dni || 'S/D'}`,
    `Dirección: ${data.owner?.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'}`,
    `Cuenta Corriente: ${data.owner?.balance !== undefined ? '$ ' + Number(data.owner.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '$ 0,00'}`,
    `Veterinario a Cargo: ${data.doctor.name} (${data.doctor.license})`,
  ].join('\n');

  autoTable(doc, {
    startY: 36,
    margin: { left: 14, right: 14 },
    head: [['DATOS DEL PACIENTE', 'DATOS DEL TUTOR TITULAR']],
    body: [[patientDetails, ownerDetails]],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 91 } },
  });

  let sectionNum = 1;
  // 3. Hospitalization Section
  if (data.hospitalizations && data.hospitalizations.length > 0) {
    const hospBody = data.hospitalizations.map((h) => [
      `Canil ${h.kennelNumber || '01'} (${h.sector || 'GENERAL'})`,
      h.admittedAt,
      h.dischargedAt || 'En curso',
      `${h.status} (${h.daysCount})`,
      `${h.primaryDiagnosis || 'Tratamiento Médico'}${h.dischargeSummary ? '\nEpicrisis: ' + h.dischargeSummary : ''}`,
    ]);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. REGISTRO DE INTERNACIÓN`, 'INGRESO', 'EGRESO', 'ESTADO & DÍAS', 'DIAGNÓSTICO & EPICRISIS']],
      body: hospBody,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 31], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, cellPadding: 2 },
    });
  }

  // 4. Vital Signs Section
  if (data.vitals && data.vitals.length > 0) {
    const vitalsBody = data.vitals.map((v) => [
      `${v.dayOfWeek} ${v.date} ${v.time}`,
      v.temp ? `${v.temp} °C` : '-',
      v.hr ? `${v.hr} lpm` : '-',
      v.rr ? `${v.rr} rpm` : '-',
      v.bp || '-',
      v.spo2Glucose || '-',
      v.pain !== undefined ? `${v.pain}/10` : '-',
      v.recordedBy || data.doctor.name,
    ]);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. SIGNOS VITALES`, 'TEMP', 'FC', 'FR', 'P. ART.', 'SpO2 / GLUC.', 'DOLOR', 'PROFESIONAL']],
      body: vitalsBody,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, cellPadding: 1.8 },
    });
  }

  // 5. Evolutions Section
  if (data.evolutions && data.evolutions.length > 0) {
    const evoBody = data.evolutions.map((e) => {
      const norm = normalizeDoctorProfessional(e.author, e.license);
      const cleanContent = (e.content || '').replace(/\*\*(.*?)\*\*/g, '$1');
      return [
        `${e.dayOfWeek} ${e.date} ${e.time} hs\n(${e.type || 'Médica'})`,
        cleanContent,
        `${norm.name}\n${norm.license}`,
      ];
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. EVOLUCIÓN CLÍNICA`, 'CONTENIDO / NOTA MÉDICA', 'PROFESIONAL']],
      body: evoBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 31], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 110 }, 2: { cellWidth: 40 } },
    });
  }

  // 6. Medications Administered Section
  if (data.medications && data.medications.length > 0) {
    const medBody = data.medications.map((m) => [
      `${m.dayOfWeek} ${m.date}`,
      `${m.time} hs`,
      m.drugName,
      m.dose,
      m.route,
      m.administeredBy,
    ]);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. MEDICACIÓN ADMINISTRADA`, 'HORA', 'FÁRMACO / ACTIVO', 'DOSIS', 'VÍA', 'ADMINISTRADO POR']],
      body: medBody,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, cellPadding: 1.8 },
    });
  }

  // 7. Studies & Surgeries Section
  if (data.studies && data.studies.length > 0) {
    const studyBody = data.studies.map((s) => [
      s.date,
      s.type,
      s.title,
      s.details,
    ]);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. ESTUDIOS & CIRUGÍAS`, 'TIPO', 'ESTUDIO / PROCEDIMIENTO', 'DETALLE & CONCLUSIONES']],
      body: studyBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 31], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 26 }, 2: { cellWidth: 48 }, 3: { cellWidth: 84 } },
    });
  }

  // 8. Financials & Liquidation Section
  if (data.financials && data.financials.items && data.financials.items.length > 0) {
    const finBody: any[] = data.financials.items.map((it) => [
      it.category,
      it.description,
      String(it.quantity),
      `$ ${Number(it.unitPrice).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      `$ ${Number(it.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    ]);

    finBody.push([
      'TOTALES',
      `Total Gastado: $ ${Number(data.financials.totalSpent).toLocaleString('es-AR', { minimumFractionDigits: 2 })}   |   Total Abonado: $ ${Number(data.financials.totalPaid).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      '',
      'SALDO PENDIENTE:',
      `$ ${Number(data.financials.balanceDue).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      margin: { left: 14, right: 14 },
      head: [[`${sectionNum++}. LIQUIDACIÓN DE GASTOS`, 'DESCRIPCIÓN DEL INSUMO / SERVICIO', 'CANT.', 'P. UNITARIO', 'SUBTOTAL']],
      body: finBody,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, cellPadding: 1.8 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 86 },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 27, halign: 'right' },
        4: { cellWidth: 27, halign: 'right' },
      },
    });
  }

  // 9. Signatures Block
  let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 220;
  if (finalY > 245) {
    doc.addPage();
    finalY = 25;
  }

  doc.setDrawColor(100, 116, 139);
  // Signature Left: Tutor
  doc.line(25, finalY + 16, 85, finalY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(data.owner?.name || 'Tutor Responsable', 55, finalY + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Firma del Tutor / Titular · DNI ${data.owner?.dni || 'S/D'}`, 55, finalY + 25, { align: 'center' });

  // Signature Right: Doctor
  const normDoc = normalizeDoctorProfessional(data.doctor?.name, data.doctor?.license);
  doc.line(125, finalY + 16, 185, finalY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(normDoc.name, 155, finalY + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Médico Veterinario · ${normDoc.license.includes('502') ? 'M.P. 502' : normDoc.license}`, 155, finalY + 25, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Dirección Médica • Veterinaria Ranquel', 155, finalY + 29, { align: 'center' });

  // 10. Page Numbers & Legal Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Historia clínica oficial expedida bajo secreto médico veterinario · Clínica Veterinaria Ranquel (Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347))',
      14,
      290
    );
    doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
  }

  return doc;
}

export async function downloadMedicalHistoryPdf(
  data: PrintableMedicalHistoryData,
  customFileName?: string
): Promise<boolean> {
  try {
    const doc = generateMedicalHistoryPdfDocument(data);
    const petName = (data.patient.name || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
    const hcCode = (data.patient.hc || 'HC').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = customFileName || `Historia_Clinica_${petName}_${hcCode}.pdf`;

    // 1. Trigger Direct Download with jsPDF
    doc.save(fileName);

    // 2. Blob fallback for universal mobile & web compatibility
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      } catch {}
    }

    return true;
  } catch (err) {
    console.error('Error generating and downloading medical history PDF:', err);
    // Fallback to print if browser canvas/PDF fails
    printA4MedicalHistory(data);
    return false;
  }
}

export interface PrintableDailyCashCloseData {
  date: string;
  time: string;
  responsibleName: string;
  branchName: string;
  branchAddress: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  breakdown: {
    cashTotal: number;
    transferTotal: number;
    qrTotal: number;
    cardTotal: number;
  };
  transactions: {
    time: string;
    concept: string;
    clientName: string;
    paymentMethod: string;
    amount: number;
  }[];
}

export function printDailyCashClose(data: PrintableDailyCashCloseData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Arqueo y Cierre de Caja — ${data.date}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .logo-title {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .logo-sub {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
          .doc-badge {
            background: #f0fdfa;
            border: 1px solid #0f766e;
            padding: 4px 10px;
            border-radius: 6px;
            text-align: right;
          }
          .doc-badge-title {
            font-size: 12px;
            font-weight: 900;
            color: #0f766e;
          }
          .grid-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 15px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 10px;
          }
          .stat-label {
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
          }
          .stat-val {
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 10px;
          }
          th {
            background: #f1f5f9;
            padding: 6px 8px;
            text-align: left;
            font-weight: 800;
            font-size: 9.5px;
            border-bottom: 1.5px solid #cbd5e1;
            color: #334155;
            text-transform: uppercase;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .total-box {
            margin-top: 15px;
            padding: 10px 14px;
            background: #f0fdfa;
            border: 1.5px solid #0f766e;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .sig-line {
            width: 200px;
            border-top: 1px solid #64748b;
            text-align: center;
            padding-top: 5px;
            font-size: 9px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="logo-title">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="logo-sub">Dirección Médica: Dr. Diego Iván Irusta • M.P. 502</div>
            <div class="logo-sub">${data.branchName} · ${data.branchAddress} · Río Cuarto, Cba.</div>
          </div>
          <div class="doc-badge">
            <div class="doc-badge-title">ARQUEO & CIERRE DE CAJA</div>
            <div style="font-size: 9.5px; color: #475569;">Fecha: ${data.date} · ${data.time} hs</div>
            <div style="font-size: 9px; color: #64748b;">Resp: ${data.responsibleName}</div>
          </div>
        </div>

        <div class="grid-summary">
          <div class="stat-card">
            <div class="stat-label">Efectivo en Caja</div>
            <div class="stat-val" style="color: #047857;">$${data.breakdown.cashTotal.toLocaleString('es-AR')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Transferencias / MP</div>
            <div class="stat-val" style="color: #0284c7;">$${data.breakdown.transferTotal.toLocaleString('es-AR')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tarjetas Débito/Créd.</div>
            <div class="stat-val" style="color: #7c3aed;">$${data.breakdown.cardTotal.toLocaleString('es-AR')}</div>
          </div>
          <div class="stat-card" style="background: #f0fdfa; border-color: #0f766e;">
            <div class="stat-label" style="color: #0f766e;">Total Recaudado</div>
            <div class="stat-val" style="color: #0f766e;">$${data.totalIncome.toLocaleString('es-AR')}</div>
          </div>
        </div>

        <div style="font-weight: 800; font-size: 11px; margin-top: 15px; color: #0f766e; text-transform: uppercase;">
          Detalle de Transacciones y Cobros del Turno (${data.transactions.length})
        </div>

        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Concepto / Atención</th>
              <th>Cliente / Paciente</th>
              <th>Medio de Pago</th>
              <th style="text-align: right;">Importe ($)</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map(t => `
              <tr>
                <td style="font-weight: 700;">${t.time} hs</td>
                <td style="font-weight: 700; color: #0f172a;">${t.concept}</td>
                <td>${t.clientName}</td>
                <td>${t.paymentMethod}</td>
                <td style="text-align: right; font-weight: 800; font-family: monospace;">$${t.amount.toLocaleString('es-AR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-box">
          <div style="font-weight: 800; font-size: 12px; color: #0f766e;">BALANCE NETO DE CAJA DEL DÍA:</div>
          <div style="font-weight: 900; font-size: 16px; color: #0f766e; font-family: monospace;">
            $${data.netBalance.toLocaleString('es-AR')} ARS
          </div>
        </div>

        <div class="signatures">
          <div class="sig-line">
            Firma Operador de Caja / Recepción<br>
            ${data.responsibleName}
          </div>
          <div class="sig-line">
            Firma y Sello Dirección Médica<br>
            Dr. Diego Iván Irusta • M.P. 502
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

export interface PrintablePrescriptionData {
  prescriptionNumber: string;
  date: string;
  time: string;
  type: string;
  diagnosis: string;
  notes?: string;
  doctor: {
    name: string;
    license: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    species: string;
    breed: string;
    weight: string;
    age: string;
    hc: string;
  };
  owner: {
    name: string;
    dni: string;
    phone: string;
    address: string;
  };
  items: {
    medicationName: string;
    activeIngredient?: string;
    presentation: string;
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    quantityPrescribed: number;
    instructions: string;
  }[];
}

export function printA4Prescription(data: PrintablePrescriptionData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Receta Médica — ${data.prescriptionNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
          .rx-badge {
            background: #f0fdfa;
            border: 1.5px solid #0f766e;
            padding: 6px 12px;
            border-radius: 8px;
            text-align: right;
          }
          .rx-num {
            font-size: 13px;
            font-weight: 900;
            color: #0f766e;
            font-family: monospace;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
          }
          .card-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }
          .rp-heading {
            font-size: 16px;
            font-weight: 900;
            font-serif: serif;
            color: #0f766e;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .med-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 3.5px solid #0f766e;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 10px;
          }
          .med-name {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
          }
          .med-detail {
            font-size: 10.5px;
            color: #334155;
            margin-top: 2px;
          }
          .med-instructions {
            font-size: 10px;
            color: #0f766e;
            font-style: italic;
            margin-top: 4px;
            background: #f0fdfa;
            padding: 3px 6px;
            border-radius: 4px;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: flex-end;
          }
          .sig-box {
            width: 240px;
            text-align: center;
          }
          .sig-line {
            border-top: 1.5px solid #0f172a;
            margin-bottom: 4px;
          }
          .footer-note {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Dirección Médica: ${data.doctor.name} · ${data.doctor.license}</div>
            <div class="clinic-sub">${data.branch.name} · ${data.branch.address} · Tel: ${data.branch.phone} · Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</div>
          </div>
          <div class="rx-badge">
            <div style="font-size: 8.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Receta Médica Veterinaria</div>
            <div class="rx-num">${data.prescriptionNumber}</div>
            <div style="font-size: 9px; color: #475569; margin-top: 2px;">Fecha: ${data.date}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="card-title">Datos del Paciente</div>
            <div><b>Nombre:</b> ${data.patient.name} · <b>Especie:</b> ${data.patient.species}</div>
            <div><b>Raza:</b> ${data.patient.breed} · <b>Peso:</b> ${data.patient.weight}</div>
            <div><b>HC:</b> ${data.patient.hc} · <b>Edad:</b> ${data.patient.age}</div>
          </div>
          <div class="info-card">
            <div class="card-title">Datos del Tutor Responsable</div>
            <div><b>Tutor:</b> ${data.owner.name}</div>
            <div><b>DNI:</b> ${data.owner.dni} · <b>Tel:</b> ${data.owner.phone}</div>
            <div><b>Domicilio:</b> ${data.owner.address}</div>
          </div>
        </div>

        <div style="margin-bottom: 12px; font-size: 11px;">
          <b>Diagnóstico Clínico / Motivo:</b> ${data.diagnosis}
        </div>

        <div class="rp-heading">
          <span>℞</span>
          <span style="font-size: 12px; font-weight: 800; text-transform: uppercase;">Prescripción & Plan Farmacológico</span>
        </div>

        <div class="med-list">
          ${data.items.map((it, idx) => `
            <div class="med-item">
              <div style="display: flex; justify-content: space-between;">
                <div class="med-name">${idx + 1}. ${it.medicationName} ${it.presentation ? '(${it.presentation})' : ''}</div>
                <div style="font-weight: 800; font-size: 10.5px; color: #0f766e;">Cant: ${it.quantityPrescribed}</div>
              </div>
              ${it.activeIngredient ? `<div style="font-size: 9.5px; color: #64748b;">Principio activo: ${it.activeIngredient}</div>` : ''}
              <div class="med-detail">
                <b>Posología:</b> ${it.dose} · <b>Vía:</b> ${it.route} · <b>Frecuencia:</b> ${it.frequency} · <b>Duración:</b> ${it.duration}
              </div>
              ${it.instructions ? `<div class="med-instructions"><b>Indicaciones:</b> ${it.instructions}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${data.notes ? `
          <div style="margin-top: 10px; padding: 6px 10px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; font-size: 9.5px; color: #92400e;">
            <b>Observaciones Adicionales:</b> ${data.notes}
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.doctor.name}</div>
            <div style="font-size: 9.5px; color: #475569;">Médico Veterinario · ${data.doctor.license}</div>
            <div style="font-size: 8.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Receta extendida conforme a la Ley de Ejercicio Profesional Veterinario y reglamentación sanitaria SENASA. Válida por 30 días corridos a partir de su emisión.
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

export interface PrintableLabReportData {
  orderNumber: string;
  testType: string;
  date: string;
  time: string;
  status: string;
  requestedBy: string;
  conclusions?: string;
  doctor: {
    name: string;
    license: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    species: string;
    breed: string;
    weight: string;
    age: string;
    hc: string;
  };
  owner: {
    name: string;
    dni: string;
    phone: string;
  };
  results: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  }[];
}

export function printA4LabReport(data: PrintableLabReportData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Informe de Laboratorio — ${data.orderNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
          .lab-badge {
            background: #f0fdfa;
            border: 1.5px solid #0f766e;
            padding: 6px 12px;
            border-radius: 8px;
            text-align: right;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
          }
          .card-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 15px;
          }
          th {
            background: #f1f5f9;
            padding: 6px 8px;
            text-align: left;
            font-weight: 800;
            font-size: 9.5px;
            border-bottom: 1.5px solid #cbd5e1;
            color: #334155;
            text-transform: uppercase;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10.5px;
          }
          .val-abnormal {
            font-weight: 900;
            color: #b91c1c;
            background: #fef2f2;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #fecaca;
          }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
          }
          .sig-box {
            width: 240px;
            text-align: center;
          }
          .sig-line {
            border-top: 1.5px solid #0f172a;
            margin-bottom: 4px;
          }
          .footer-note {
            margin-top: 25px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Dirección Médica: ${data.doctor.name} · ${data.doctor.license}</div>
            <div class="clinic-sub">${data.branch.name} · ${data.branch.address} · Tel: ${data.branch.phone} · Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</div>
          </div>
          <div class="lab-badge">
            <div style="font-size: 8.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Laboratorio de Análisis Clínicos</div>
            <div style="font-size: 13px; font-weight: 900; color: #0f766e; font-family: monospace;">${data.orderNumber}</div>
            <div style="font-size: 9px; color: #475569; margin-top: 2px;">Fecha: ${data.date} · ${data.time} hs</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="card-title">Datos del Paciente</div>
            <div><b>Nombre:</b> ${data.patient.name} · <b>Especie:</b> ${data.patient.species}</div>
            <div><b>Raza:</b> ${data.patient.breed} · <b>Peso:</b> ${data.patient.weight}</div>
            <div><b>HC:</b> ${data.patient.hc} · <b>Edad:</b> ${data.patient.age}</div>
          </div>
          <div class="info-card">
            <div class="card-title">Datos del Estudio & Solicitante</div>
            <div><b>Estudio:</b> ${data.testType}</div>
            <div><b>Solicitante:</b> ${data.requestedBy}</div>
            <div><b>Tutor:</b> ${data.owner.name} · <b>Tel:</b> ${data.owner.phone}</div>
          </div>
        </div>

        <div style="font-weight: 800; font-size: 11px; color: #0f766e; text-transform: uppercase; margin-top: 10px;">
          Resultados Analíticos Obtenidos (${data.results.length} determinaciones)
        </div>

        <table>
          <thead>
            <tr>
              <th>Parámetro / Determinación</th>
              <th>Resultado</th>
              <th>Unidad</th>
              <th>Rango de Referencia (${data.patient.species})</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${data.results.map(r => `
              <tr>
                <td style="font-weight: 700;">${r.parameter}</td>
                <td>
                  <span class="${r.isAbnormal ? 'val-abnormal' : ''}">${r.value}</span>
                </td>
                <td style="color: #64748b; font-family: monospace;">${r.unit}</td>
                <td style="font-family: monospace; color: #334155;">${r.referenceRange}</td>
                <td>
                  <span style="font-weight: bold; color: ${r.isAbnormal ? '#dc2626' : '#16a34a'};">
                    ${r.isAbnormal ? '⚠ Fuera de rango' : '✓ Normal'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${data.conclusions ? `
          <div style="margin-top: 15px; padding: 10px 14px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px;">
            <div style="font-weight: 800; font-size: 10px; color: #0f766e; text-transform: uppercase; margin-bottom: 3px;">
              Conclusiones & Observaciones Clínicas:
            </div>
            <div style="font-size: 10.5px; color: #1e293b;">${data.conclusions}</div>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.doctor.name}</div>
            <div style="font-size: 9.5px; color: #475569;">Bioquímico / Médico Veterinario · ${data.doctor.license}</div>
            <div style="font-size: 8.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Informe de laboratorio clínico veterinario. Los resultados deben correlacionarse con el cuadro clínico del paciente por el médico tratante.
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

export interface PrintableImagingReportData {
  studyNumber: string;
  modality: string;
  region: string;
  date: string;
  time: string;
  status: string;
  radiologistName: string;
  findings: string;
  conclusions: string;
  images?: string[];
  doctor: {
    name: string;
    license: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    species: string;
    breed: string;
    weight: string;
    age: string;
    hc: string;
  };
  owner: {
    name: string;
    dni: string;
    phone: string;
  };
}

export function printA4ImagingReport(data: PrintableImagingReportData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Informe de Diagnóstico por Imágenes — ${data.studyNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
          .img-badge {
            background: #f0fdfa;
            border: 1.5px solid #0f766e;
            padding: 6px 12px;
            border-radius: 8px;
            text-align: right;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
          }
          .card-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }
          .section-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 3.5px solid #0f766e;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 12px;
          }
          .section-title {
            font-weight: 800;
            font-size: 10.5px;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
          }
          .sig-box {
            width: 240px;
            text-align: center;
          }
          .sig-line {
            border-top: 1.5px solid #0f172a;
            margin-bottom: 4px;
          }
          .footer-note {
            margin-top: 25px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Dirección Médica: ${data.doctor.name} · ${data.doctor.license}</div>
            <div class="clinic-sub">${data.branch.name} · ${data.branch.address} · Tel: ${data.branch.phone} · Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</div>
          </div>
          <div class="img-badge">
            <div style="font-size: 8.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Diagnóstico por Imágenes</div>
            <div style="font-size: 13px; font-weight: 900; color: #0f766e; font-family: monospace;">${data.studyNumber}</div>
            <div style="font-size: 9px; color: #475569; margin-top: 2px;">Fecha: ${data.date} · ${data.time} hs</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="card-title">Datos del Paciente</div>
            <div><b>Nombre:</b> ${data.patient.name} · <b>Especie:</b> ${data.patient.species}</div>
            <div><b>Raza:</b> ${data.patient.breed} · <b>Peso:</b> ${data.patient.weight}</div>
            <div><b>HC:</b> ${data.patient.hc} · <b>Edad:</b> ${data.patient.age}</div>
          </div>
          <div class="info-card">
            <div class="card-title">Datos del Estudio Realizado</div>
            <div><b>Modalidad:</b> ${data.modality}</div>
            <div><b>Región Anatómica:</b> ${data.region}</div>
            <div><b>Especialista / Informante:</b> ${data.radiologistName}</div>
            <div><b>Tutor:</b> ${data.owner.name} · <b>Tel:</b> ${data.owner.phone}</div>
          </div>
        </div>

        <div class="section-box">
          <div class="section-title">Hallazgos & Descripción Radiológica / Ecográfica:</div>
          <div style="font-size: 11px; color: #1e293b; white-space: pre-line;">${data.findings || 'Sin hallazgos patológicos significativos observados.'}</div>
        </div>

        <div class="section-box" style="background: #f0fdfa; border-color: #0f766e;">
          <div class="section-title">Conclusión Diagnóstica & Sugerencias:</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f766e; white-space: pre-line;">${data.conclusions || 'Estudio compatible con parámetros normales.'}</div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.radiologistName || data.doctor.name}</div>
            <div style="font-size: 9.5px; color: #475569;">Especialista en Diagnóstico por Imágenes · ${data.doctor.license}</div>
            <div style="font-size: 8.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Informe de diagnóstico por imágenes. Documento médico oficial con validez clínico-legal.
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

export interface PrintableVaccineCertificateData {
  certificateNumber: string;
  vaccineName: string;
  type?: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  administeredDate: string;
  nextDueDate: string;
  doseVolume?: string;
  route?: string;
  notes?: string;
  doctor: {
    name: string;
    license: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    species: string;
    breed: string;
    weight: string;
    age: string;
    hc: string;
    sex?: string;
    microchip?: string;
  };
  owner: {
    name: string;
    dni: string;
    phone: string;
    address: string;
  };
}

export function printA4VaccineCertificate(data: PrintableVaccineCertificateData) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Certificado de Vacunación — ${data.patient.name}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0f766e;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
          }
          .cert-badge {
            background: #f0fdfa;
            border: 1.5px solid #0f766e;
            padding: 6px 12px;
            border-radius: 8px;
            text-align: right;
          }
          .cert-num {
            font-size: 13px;
            font-weight: 900;
            color: #0f766e;
            font-family: monospace;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .info-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
          }
          .card-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }
          .vaccine-main-box {
            background: #ffffff;
            border: 2px solid #0f766e;
            border-radius: 8px;
            padding: 14px 18px;
            margin-top: 15px;
            margin-bottom: 15px;
          }
          .vaccine-title {
            font-size: 15px;
            font-weight: 900;
            color: #0f766e;
          }
          .vaccine-detail-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 12px;
            font-size: 10.5px;
          }
          .detail-label {
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
          }
          .detail-value {
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: flex-end;
          }
          .sig-box {
            width: 240px;
            text-align: center;
          }
          .sig-line {
            border-top: 1.5px solid #0f172a;
            margin-bottom: 4px;
          }
          .footer-note {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;"><img src="/logo-ranquel.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; padding: 2px; margin-right: 12px; vertical-align: middle;" alt="Logo Ranquel" /><div><div class="clinic-name">CLÍNICA VETERINARIA RANQUEL</div>
            <div class="clinic-sub">Dirección Médica: ${data.doctor.name} · ${data.doctor.license}</div>
            <div class="clinic-sub">${data.branch.name} · ${data.branch.address} · Tel: ${data.branch.phone} · Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</div>
          </div>
          <div class="cert-badge">
            <div style="font-size: 8.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Certificado de Vacunación</div>
            <div class="cert-num">${data.certificateNumber}</div>
            <div style="font-size: 9px; color: #475569; margin-top: 2px;">Fecha: ${data.administeredDate}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="card-title">Datos del Paciente Inmunizado</div>
            <div><b>Nombre:</b> ${data.patient.name} · <b>Especie:</b> ${data.patient.species}</div>
            <div><b>Raza:</b> ${data.patient.breed} · <b>Peso:</b> ${data.patient.weight}</div>
            <div><b>HC:</b> ${data.patient.hc} · <b>Edad:</b> ${data.patient.age}</div>
            ${data.patient.microchip ? `<div><b>Microchip / Identificación:</b> ${data.patient.microchip}</div>` : ''}
          </div>
          <div class="info-card">
            <div class="card-title">Datos del Tutor Responsable</div>
            <div><b>Tutor:</b> ${data.owner.name}</div>
            <div><b>DNI:</b> ${data.owner.dni} · <b>Tel:</b> ${data.owner.phone}</div>
            <div><b>Domicilio:</b> ${data.owner.address}</div>
          </div>
        </div>

        <div class="vaccine-main-box">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="vaccine-title">💉 ${data.vaccineName}</div>
            <div style="background: #f0fdfa; border: 1px solid #0f766e; color: #0f766e; font-weight: 800; font-size: 9.5px; padding: 3px 8px; border-radius: 4px;">
              ${data.type || 'Inmunización Oficial'}
            </div>
          </div>

          <div class="vaccine-detail-grid">
            <div>
              <div class="detail-label">Laboratorio / Fabricante</div>
              <div class="detail-value">${data.manufacturer}</div>
            </div>
            <div>
              <div class="detail-label">Número de Lote</div>
              <div class="detail-value" style="font-family: monospace;">${data.batchNumber}</div>
            </div>
            <div>
              <div class="detail-label">Vencimiento del Biológico</div>
              <div class="detail-value">${data.expirationDate}</div>
            </div>
            <div>
              <div class="detail-label">Fecha de Aplicación</div>
              <div class="detail-value" style="color: #0f766e; font-weight: 800;">${data.administeredDate}</div>
            </div>
            <div>
              <div class="detail-label">Próximo Refuerzo Sugerido</div>
              <div class="detail-value" style="color: #b45309; font-weight: 800;">${data.nextDueDate}</div>
            </div>
            <div>
              <div class="detail-label">Vía / Dosis</div>
              <div class="detail-value">${data.route || 'Subcutánea (SC)'} · ${data.doseVolume || '1 dosis'}</div>
            </div>
          </div>

          ${data.notes ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 9.5px; color: #475569;">
              <b>Observaciones:</b> ${data.notes}
            </div>
          ` : ''}
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-weight: 800; font-size: 11px;">${data.doctor.name}</div>
            <div style="font-size: 9.5px; color: #475569;">Médico Veterinario · ${data.doctor.license}</div>
            <div style="font-size: 8.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">Dirección Médica • Veterinaria Ranquel</div>
          </div>
        </div>

        <div class="footer-note">
          Certificado oficial de vacunación e inmunización animal expedido conforme a normas higiénico-sanitarias vigentes y registrado en el sistema hospitalario.
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

export interface PrintableCompleteVaccineBookletData {
  patient: {
    name: string;
    species: string;
    breed: string;
    weight: string;
    age: string;
    hc: string;
    sex?: string;
    microchip?: string;
    color?: string;
  };
  owner: {
    name: string;
    dni: string;
    phone: string;
    address: string;
  };
  doctor: {
    name: string;
    license: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  vaccines: {
    id: string;
    vaccineName: string;
    type?: string;
    batchNumber: string;
    manufacturer?: string;
    expirationDate?: string;
    administeredDate: string;
    nextDueDate: string;
    doseVolume?: string;
    route?: string;
    administeredBy: string;
    vetLicense?: string;
    notes?: string;
  }[];
}

/**
 * Genera el documento PDF con jsPDF para el Certificado Individual de Vacunación
 */
export function generateVaccineCertificatePdf(data: PrintableVaccineCertificateData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Top Decorative Bar & Header
  doc.setFillColor(15, 118, 110);
  doc.rect(14, 10, 182, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 118, 110);
  doc.text('CLÍNICA VETERINARIA RANQUEL', 14, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Centro Hospitalario Veterinario • Guardia 24 Hs & Inmunizaciones', 14, 24);
  doc.text(`${data.branch.name || 'Sede Central'} • ${data.branch.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'} • Tel: ${data.branch.phone || '+54 9 2942 47-7136'}`, 14, 28);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Dirección Médica: ${data.doctor.name} — ${data.doctor.license}`, 14, 33);

  // Right Badge Box
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.5);
  doc.roundedRect(130, 14, 66, 21, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text('CERTIFICADO DE VACUNACIÓN', 133, 19);

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text(data.certificateNumber, 133, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha Emisión: ${data.administeredDate}`, 133, 31);

  // 2. Patient & Owner Summary Table
  const patientDetails = [
    `Nombre: ${data.patient.name}`,
    `Especie / Raza: ${data.patient.species} • ${data.patient.breed}`,
    `Sexo / Edad: ${data.patient.sex || 'S/D'} • ${data.patient.age || 'S/D'}`,
    `Peso: ${data.patient.weight}`,
    `Historia Clínica: ${data.patient.hc}`,
    data.patient.microchip ? `Microchip: ${data.patient.microchip}` : 'Microchip: No registrado',
  ].join('\n');

  const ownerDetails = [
    `Tutor: ${data.owner.name}`,
    `DNI / CUIT: ${data.owner.dni}`,
    `Teléfono: ${data.owner.phone}`,
    `Domicilio: ${data.owner.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'}`,
    `Veterinario: ${data.doctor.name}`,
    `Matrícula: ${data.doctor.license}`,
  ].join('\n');

  autoTable(doc, {
    startY: 38,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [15, 23, 42] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 118, 110], fontStyle: 'bold' },
    head: [['DATOS DEL PACIENTE INMUNIZADO', 'DATOS DEL TUTOR RESPONSABLE']],
    body: [[patientDetails, ownerDetails]],
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Vaccine Details Table
  doc.setFillColor(15, 118, 110);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`BIOLÓGICO APLICADO: ${data.vaccineName.toUpperCase()} (${data.type || 'INMUNIZACIÓN OFICIAL'})`, 17, currentY + 5);

  currentY += 9;

  const vaccineDetails = [
    ['Laboratorio / Fabricante:', data.manufacturer || 'S/D', 'Número de Lote:', data.batchNumber || 'S/D'],
    ['Fecha de Aplicación:', data.administeredDate, 'Vencimiento Biológico:', data.expirationDate || 'S/D'],
    ['Próximo Refuerzo Sugerido:', data.nextDueDate, 'Dosis / Vía:', `${data.doseVolume || '1 dosis'} • ${data.route || 'Subcutánea (SC)'}`],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
      1: { fontStyle: 'bold', textColor: [15, 118, 110], cellWidth: 45 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
      3: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 47 },
    },
    body: vaccineDetails,
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. Observations if any
  if (data.notes) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
      headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' },
      head: [['OBSERVACIONES & PAUTAS CLÍNICAS']],
      body: [[data.notes]],
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  } else {
    currentY += 15;
  }

  // 5. Signature & Stamp Box
  if (currentY > 235) {
    doc.addPage();
    currentY = 30;
  }

  const sigX = 120;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(sigX, currentY + 18, sigX + 65, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.doctor.name, sigX + 32.5, currentY + 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Médico Veterinario • ${data.doctor.license}`, sigX + 32.5, currentY + 27, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Dirección Médica • Veterinaria Ranquel', sigX + 32.5, currentY + 31, { align: 'center' });

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Certificado oficial de vacunación e inmunización animal emitido por Veterinaria Ranquel con valor de constancia médico-sanitaria.',
    105,
    285,
    { align: 'center' }
  );

  return doc;
}

/**
 * Descarga directa en archivo PDF del Certificado Individual de Vacunación
 */
export function downloadVaccineCertificatePdf(data: PrintableVaccineCertificateData, customFilename?: string): void {
  try {
    const doc = generateVaccineCertificatePdf(data);
    const cleanPatient = (data.patient.name || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanVaccine = (data.vaccineName || 'Vacuna').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = customFilename || `Certificado_Vacunacion_${cleanPatient}_${cleanVaccine}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error al descargar certificado de vacunación PDF:', error);
    // Fallback to print method
    printA4VaccineCertificate(data);
  }
}

/**
 * Genera el documento PDF con jsPDF para la Libreta Sanitaria Completa del Paciente
 */
export function generateCompleteVaccinationBookletPdf(data: PrintableCompleteVaccineBookletData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Top Decorative Banner & Header
  doc.setFillColor(15, 118, 110);
  doc.rect(14, 10, 182, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 118, 110);
  doc.text('CLÍNICA VETERINARIA RANQUEL', 14, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Centro Hospitalario Veterinario • Pasaporte Sanitario & Plan de Inmunizaciones', 14, 24);
  doc.text(`${data.branch.name || 'Sede Central'} • ${data.branch.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'} • Tel: ${data.branch.phone || '+54 9 2942 47-7136'}`, 14, 28);

  // Badge
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.5);
  doc.roundedRect(125, 13, 71, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text('LIBRETA SANITARIA OFICIAL', 128, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ficha HC: ${data.patient.hc}`, 128, 24);
  doc.text(`Emisión: ${new Date().toLocaleDateString('es-AR')}`, 128, 29);

  // 2. Patient & Owner Summary
  const patientDetails = [
    `Nombre: ${data.patient.name}`,
    `Especie / Raza: ${data.patient.species} • ${data.patient.breed}`,
    `Sexo / Edad: ${data.patient.sex || 'S/D'} • ${data.patient.age || 'S/D'}`,
    `Peso: ${data.patient.weight}`,
    data.patient.color ? `Color / Pelaje: ${data.patient.color}` : 'Color: No reg.',
    data.patient.microchip ? `Microchip ISO: ${data.patient.microchip}` : 'Microchip: No registrado',
  ].join('\n');

  const ownerDetails = [
    `Tutor: ${data.owner.name}`,
    `DNI / CUIT: ${data.owner.dni}`,
    `Teléfono: ${data.owner.phone}`,
    `Domicilio: ${data.owner.address || 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)'}`,
    `Dirección Médica: ${data.doctor.name}`,
    `Matrícula Profesional: ${data.doctor.license}`,
  ].join('\n');

  autoTable(doc, {
    startY: 36,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [15, 23, 42] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 118, 110], fontStyle: 'bold' },
    head: [['DATOS DEL PACIENTE', 'DATOS DEL TUTOR']],
    body: [[patientDetails, ownerDetails]],
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Table of all historical vaccines
  doc.setFillColor(15, 118, 110);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`HISTORIAL DE INMUNIZACIONES & VACUNAS (${data.vaccines.length} REGISTRADAS)`, 17, currentY + 5);

  currentY += 9;

  const tableRows = data.vaccines.map((v) => [
    v.administeredDate,
    v.vaccineName,
    v.manufacturer || 'S/D',
    v.batchNumber || 'S/D',
    `${v.doseVolume || '1 dosis'} (${v.route || 'SC'})`,
    v.nextDueDate,
    `${v.administeredBy || data.doctor.name} (${v.vetLicense || 'M.P. 502'})`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 118, 110], fontStyle: 'bold' },
    head: [['Fecha', 'Vacuna / Biológico', 'Laboratorio', 'Lote', 'Dosis / Vía', 'Próximo Refuerzo', 'Profesional']],
    body: tableRows.length > 0 ? tableRows : [['-', 'No hay vacunas registradas aún', '-', '-', '-', '-', '-']],
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // 4. Signature & Stamp Box
  if (currentY > 235) {
    doc.addPage();
    currentY = 30;
  }

  const sigX = 120;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(sigX, currentY + 18, sigX + 65, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.doctor.name, sigX + 32.5, currentY + 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Médico Veterinario • ${data.doctor.license}`, sigX + 32.5, currentY + 27, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Dirección Médica • Veterinaria Ranquel', sigX + 32.5, currentY + 31, { align: 'center' });

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Libreta Sanitaria y Pasaporte Oficial de Vacunación emitido por Veterinaria Ranquel conforme a reglamentaciones sanitarias vigentes.',
    105,
    285,
    { align: 'center' }
  );

  return doc;
}

/**
 * Descarga directa en archivo PDF de la Libreta Sanitaria Completa
 */
export function downloadCompleteVaccinationBookletPdf(data: PrintableCompleteVaccineBookletData, customFilename?: string): void {
  try {
    const doc = generateCompleteVaccinationBookletPdf(data);
    const cleanPatient = (data.patient.name || 'Paciente').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = customFilename || `Libreta_Sanitaria_${cleanPatient}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error al descargar libreta sanitaria PDF:', error);
  }
}
