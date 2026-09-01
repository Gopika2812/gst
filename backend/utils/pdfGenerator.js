const PDFDocument = require('pdfkit');

/**
 * Convert number to Indian Rupee Words
 */
function numberToWordsINR(num) {
  if (!num || num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) str += a[n] + ' ';
      else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    }
    return str.trim();
  };

  return inWords(Math.round(num));
}

/**
 * Format currency with Indian Comma System
 */
function formatINR(val) {
  const n = Number(val) || 0;
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Generate Invoice PDF Stream matching Royal Accounting Official branding
 */
exports.generateInvoicePDF = (invoice, client, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoice.invoiceNumber}.pdf`);

  doc.pipe(res);

  const leftMargin = 45;
  const rightEdge = 550;
  const contentWidth = rightEdge - leftMargin;

  // ==========================
  // 1. HEADER SECTION (Logo & Title)
  // ==========================
  const logoTop = 40;

  // Draw Royal Accounting Navy & Gold Brand Badge
  doc.save();
  // Navy Ribbon Banner
  doc
    .roundedRect(leftMargin, logoTop, 180, 42, 6)
    .fill('#0A1E3F');
  
  // Gold Accent Strip
  doc
    .roundedRect(leftMargin, logoTop + 38, 180, 4, 2)
    .fill('#C59B27');

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('ROYAL ACCOUNTING', leftMargin + 10, logoTop + 10);

  doc
    .fillColor('#DFB135')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('GST & TAX CONSULTANCY SERVICES', leftMargin + 10, logoTop + 25);
  doc.restore();

  // Invoice Title & Number (Top Right)
  doc
    .fillColor('#0A1E3F')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('INVOICE', 320, logoTop, { align: 'right', width: 230 });

  doc
    .fillColor('#334155')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text(`Invoice Number : ${invoice.invoiceNumber}`, 300, logoTop + 30, { align: 'right', width: 250 });

  // Company Address Details (Left below logo)
  const compTop = logoTop + 65;
  doc
    .fillColor('#0A1E3F')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text('ROYAL ACCOUNTING', leftMargin, compTop);

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Your Trusted Partner in Tax & Business Solutions', leftMargin, compTop + 13)
    .text('Ph No / WhatsApp : +91 99943 60994', leftMargin, compTop + 25)
    .text('Email : royallogu2020@gmail.com', leftMargin, compTop + 36)
    .text('Website : royalaccounting.co.in', leftMargin, compTop + 47);

  // ==========================
  // 2. BILL TO & DATES SECTION
  // ==========================
  const billTop = compTop + 72;

  // Bill To (Left)
  doc
    .fillColor('#64748B')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Bill To', leftMargin, billTop);

  doc
    .fillColor('#0F172A')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text((client.clientName || 'Valued Client').toUpperCase(), leftMargin, billTop + 12);

  const addressText = client.address
    ? `${client.address}, ${client.city || ''} ${client.state || ''} ${client.pincode || ''}`
    : 'Tamil Nadu, India';

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text(addressText, leftMargin, billTop + 24, { width: 260 })
    .text(`Mobile No : ${client.phone || 'N/A'}`, leftMargin, billTop + 46);

  if (client.gstin) {
    doc.text(`GSTIN : ${client.gstin}`, leftMargin, billTop + 58);
  }

  // Invoice Meta Dates (Right Box)
  const dateBoxX = 350;
  const dateBoxW = 200;

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Invoice Date :', dateBoxX, billTop)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text(
      invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      dateBoxX + 80,
      billTop,
      { align: 'right', width: dateBoxW - 80 }
    );

  doc
    .font('Helvetica')
    .fillColor('#475569')
    .text('Terms :', dateBoxX, billTop + 16)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text('Due on Receipt', dateBoxX + 80, billTop + 16, { align: 'right', width: dateBoxW - 80 });

  doc
    .font('Helvetica')
    .fillColor('#475569')
    .text('Due Date :', dateBoxX, billTop + 32)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text(
      invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      dateBoxX + 80,
      billTop + 32,
      { align: 'right', width: dateBoxW - 80 }
    );

  // Status Badge
  const statusColor =
    invoice.status === 'Paid'
      ? '#C59B27'
      : invoice.status === 'Partially Paid'
      ? '#D97706'
      : invoice.status === 'Overdue'
      ? '#DC2626'
      : '#0A1E3F';

  doc
    .roundedRect(rightEdge - 85, billTop + 52, 85, 20, 4)
    .fill(statusColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text(invoice.status ? invoice.status.toUpperCase() : 'PENDING', rightEdge - 85, billTop + 58, {
      width: 85,
      align: 'center'
    });

  // ==========================
  // 3. ITEMS TABLE
  // ==========================
  const tableTop = billTop + 90;
  const colX = {
    sno: leftMargin + 8,
    desc: leftMargin + 35,
    hsn: 280,
    rate: 345,
    qty: 420,
    amount: 475
  };

  // Table Header Container
  doc
    .rect(leftMargin, tableTop, contentWidth, 24)
    .fill('#0A1E3F');

  // Header Texts
  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('#', colX.sno, tableTop + 7)
    .text('Item & Description', colX.desc, tableTop + 7)
    .text('HSN/SAC', colX.hsn, tableTop + 7)
    .text('Rate (₹)', colX.rate, tableTop + 7, { width: 65, align: 'right' })
    .text('Qty', colX.qty, tableTop + 7, { width: 40, align: 'right' })
    .text('Amount (₹)', colX.amount, tableTop + 7, { width: 70, align: 'right' });

  // Rows
  let curY = tableTop + 24;
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: 'Professional Accounting & Filing Services', hsnSac: '998231', quantity: 1, rate: invoice.subtotal || invoice.total, amount: invoice.total }];

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowH = 26;

    if (isEven) {
      doc
        .rect(leftMargin, curY, contentWidth, rowH)
        .fill('#F8FAFC');
    }

    doc
      .fillColor('#334155')
      .fontSize(8.5)
      .font('Helvetica')
      .text(String(index + 1), colX.sno, curY + 8)
      .font('Helvetica-Bold')
      .text(item.description || item.serviceName || 'Professional Service', colX.desc, curY + 8, { width: 230 })
      .font('Helvetica')
      .text(item.hsnSac || '9982', colX.hsn, curY + 8)
      .text(formatINR(item.rate || item.unitPrice || 0), colX.rate, curY + 8, { width: 65, align: 'right' })
      .text(String(item.quantity || 1), colX.qty, curY + 8, { width: 40, align: 'right' })
      .font('Helvetica-Bold')
      .text(formatINR(item.amount || item.total || (item.quantity * item.rate) || 0), colX.amount, curY + 8, { width: 70, align: 'right' });

    // Row Bottom Border
    doc
      .moveTo(leftMargin, curY + rowH)
      .lineTo(rightEdge, curY + rowH)
      .strokeColor('#E2E8F0')
      .lineWidth(0.5)
      .stroke();

    curY += rowH;
  });

  // Table Outer Frame Box
  doc
    .rect(leftMargin, tableTop, contentWidth, curY - tableTop)
    .strokeColor('#CBD5E1')
    .lineWidth(0.8)
    .stroke();

  // ==========================
  // 4. SUMMARY & TOTALS SECTION
  // ==========================
  const sumTop = curY + 15;
  const labelX = 310;
  const valX = 430;
  const valW = 115;

  // Sub Total
  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Sub Total', labelX, sumTop)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text(`₹${formatINR(invoice.subtotal || invoice.total)}`, valX, sumTop, { align: 'right', width: valW });

  // Total
  doc
    .fillColor('#0F172A')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text('Total', labelX, sumTop + 18)
    .text(`₹${formatINR(invoice.total)}`, valX, sumTop + 18, { align: 'right', width: valW });

  // Payment Made
  const paid = Number(invoice.paidAmount) || 0;
  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Payment Made', labelX, sumTop + 36)
    .fillColor('#DC2626')
    .text(`(-) ${formatINR(paid)}`, valX, sumTop + 36, { align: 'right', width: valW });

  // Balance Due Container
  const balanceDue = Math.max(0, (invoice.total || 0) - paid);
  const balBarTop = sumTop + 54;
  doc
    .rect(260, balBarTop, 290, 24)
    .fill('#F8FAFC');

  doc
    .fillColor('#0A1E3F')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Balance Due', 350, balBarTop + 7)
    .text(`₹${formatINR(balanceDue)}`, valX, balBarTop + 7, { align: 'right', width: valW });

  // Total In Words
  const wordsTop = balBarTop + 35;
  const wordsStr = `Indian Rupee ${numberToWordsINR(invoice.total)} Only`;
  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Total In Words:', 310, wordsTop)
    .font('Helvetica-BoldOblique')
    .fillColor('#0F172A')
    .text(wordsStr, 375, wordsTop, { width: 175, align: 'right' });

  // ==========================
  // 5. NOTES & SIGNATURE
  // ==========================
  const notesTop = balBarTop + 65;

  doc
    .fillColor('#0A1E3F')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Notes', leftMargin, notesTop);

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Thank you for trusting Royal Accounting for your business needs.', leftMargin, notesTop + 14);

  // Official Signature Box
  const signTop = notesTop + 20;

  doc
    .fillColor('#0A1E3F')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('For ROYAL ACCOUNTING', rightEdge - 160, signTop, { width: 160, align: 'center' });

  doc
    .moveTo(rightEdge - 160, signTop + 55)
    .lineTo(rightEdge, signTop + 55)
    .strokeColor('#C59B27')
    .lineWidth(1)
    .stroke();

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Authorized Signatory', rightEdge - 160, signTop + 60, { width: 160, align: 'center' });

  // ==========================
  // 6. FOOTER
  // ==========================
  doc
    .moveTo(leftMargin, 790)
    .lineTo(rightEdge, 790)
    .strokeColor('#C59B27')
    .lineWidth(1)
    .stroke();

  doc
    .fillColor('#0A1E3F')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('ROYAL ACCOUNTING — Your Trusted Partner in Tax & Business Solutions', leftMargin, 795);

  doc
    .fillColor('#94A3B8')
    .fontSize(8)
    .font('Helvetica')
    .text('1', rightEdge - 10, 795);

  doc.end();
};
