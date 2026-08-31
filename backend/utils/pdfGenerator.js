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
 * Generate Invoice PDF Stream matching the exact official template
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

  // Draw Stylized Vignesh Associates "VA" Ribbon Logo
  doc.save();
  // Navy Left Ribbon
  doc
    .polygon([leftMargin + 25, logoTop], [leftMargin + 40, logoTop], [leftMargin + 20, logoTop + 45], [leftMargin + 5, logoTop + 45])
    .fill('#0F2B48');
  // Green Right Ribbon
  doc
    .polygon([leftMargin + 45, logoTop], [leftMargin + 60, logoTop], [leftMargin + 40, logoTop + 45], [leftMargin + 25, logoTop + 45])
    .fill('#52A636');
  // Green Bottom Banner "Vignesh Associates"
  doc
    .roundedRect(leftMargin, logoTop + 50, 110, 20, 3)
    .fill('#0F2B48');
  doc
    .roundedRect(leftMargin + 45, logoTop + 50, 65, 20, 3)
    .fill('#52A636');
  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Vignesh', leftMargin + 6, logoTop + 56)
    .text('Associates', leftMargin + 48, logoTop + 56);
  doc.restore();

  // Invoice Title & Number (Top Right)
  doc
    .fillColor('#1E293B')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('INVOICE', 320, logoTop, { align: 'right', width: 230 });

  doc
    .fillColor('#334155')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text(`Invoice Number : ${invoice.invoiceNumber}`, 300, logoTop + 30, { align: 'right', width: 250 });

  // Company Address Details (Left below logo)
  const compTop = logoTop + 85;
  doc
    .fillColor('#1E293B')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text('VIGNESH ASSOCIATES', leftMargin, compTop);

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('No.523D, 2nd Floor, Mannaraja Koil Opposite,', leftMargin, compTop + 13)
    .text('Udangudi Road, Tisaiyanvillai,', leftMargin, compTop + 24)
    .text('Tirunelveli, Tamil Nadu - 627657', leftMargin, compTop + 35)
    .text('Ph No : 9865571219 / 8098071219', leftMargin, compTop + 46);

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
    doc.text(`GSTIN : ${client.gstin}`, leftMargin, billTop + 57);
  }

  // Invoice Dates & Terms (Right)
  const metaLeft = 360;
  const invDateStr = new Date(invoice.invoiceDate).toLocaleDateString('en-GB'); // DD/MM/YYYY
  const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : invDateStr;

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Invoice Date :', metaLeft, billTop + 12)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text(invDateStr, metaLeft + 80, billTop + 12, { align: 'right', width: 110 });

  doc
    .font('Helvetica')
    .fillColor('#475569')
    .text('Terms :', metaLeft, billTop + 28)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text('Due on Receipt', metaLeft + 80, billTop + 28, { align: 'right', width: 110 });

  doc
    .font('Helvetica')
    .fillColor('#475569')
    .text('Due Date :', metaLeft, billTop + 44)
    .font('Helvetica-Bold')
    .fillColor('#0F172A')
    .text(dueDateStr, metaLeft + 80, billTop + 44, { align: 'right', width: 110 });

  // ==========================
  // 3. LINE ITEMS TABLE
  // ==========================
  const tableTop = billTop + 85;

  // Table Header Background (Dark Charcoal #333333)
  doc
    .rect(leftMargin, tableTop, contentWidth, 22)
    .fill('#333333');

  // Table Header Text
  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('#', leftMargin + 10, tableTop + 6)
    .text('Item & Description', leftMargin + 35, tableTop + 6)
    .text('Qty', 330, tableTop + 6, { align: 'right', width: 45 })
    .text('Rate', 390, tableTop + 6, { align: 'right', width: 65 })
    .text('Amount', 470, tableTop + 6, { align: 'right', width: 70 });

  // Table Rows
  let curY = tableTop + 22;
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: invoice.serviceType || 'Professional Services', amount: invoice.subTotal || invoice.total }];

  items.forEach((item, index) => {
    const itemAmount = Number(item.amount) || 0;

    doc
      .fillColor('#1E293B')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text(`${index + 1}`, leftMargin + 10, curY + 8)
      .text(item.description, leftMargin + 35, curY + 8, { width: 280 })
      .font('Helvetica')
      .text('1.00', 330, curY + 8, { align: 'right', width: 45 })
      .text(formatINR(itemAmount), 390, curY + 8, { align: 'right', width: 65 })
      .text(formatINR(itemAmount), 470, curY + 8, { align: 'right', width: 70 });

    curY += 26;

    // Row divider line
    doc
      .moveTo(leftMargin, curY)
      .lineTo(rightEdge, curY)
      .strokeColor('#E2E8F0')
      .lineWidth(0.5)
      .stroke();
  });

  // ==========================
  // 4. SUMMARY TOTALS
  // ==========================
  const sumTop = curY + 15;
  const labelX = 350;
  const valX = 450;
  const valW = 90;

  // Sub Total
  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Sub Total', labelX, sumTop)
    .text(formatINR(invoice.subTotal || invoice.total), valX, sumTop, { align: 'right', width: valW });

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

  // Balance Due (Light Gray Bar Container)
  const balanceDue = Math.max(0, (invoice.total || 0) - paid);
  const balBarTop = sumTop + 54;
  doc
    .rect(260, balBarTop, 290, 24)
    .fill('#F1F5F9');

  doc
    .fillColor('#0F172A')
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
    .fillColor('#1E293B')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Notes', leftMargin, notesTop);

  doc
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Thanks for your business.', leftMargin, notesTop + 14);

  // Authorized Signature (Left below notes)
  const signTop = notesTop + 45;

  // Draw signature vector stroke
  doc.save();
  doc
    .strokeColor('#1E3A8A')
    .lineWidth(1.2)
    .moveTo(leftMargin + 10, signTop + 35)
    .bezierCurveTo(leftMargin + 30, signTop + 5, leftMargin + 50, signTop + 10, leftMargin + 70, signTop + 30)
    .bezierCurveTo(leftMargin + 85, signTop + 45, leftMargin + 100, signTop + 10, leftMargin + 120, signTop + 25)
    .bezierCurveTo(leftMargin + 130, signTop + 35, leftMargin + 140, signTop + 15, leftMargin + 145, signTop + 40)
    .stroke();
  doc.restore();

  doc
    .fillColor('#1E293B')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('SAINATH S', leftMargin, signTop + 55);

  doc
    .fillColor('#64748B')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Authorized Signature', leftMargin, signTop + 67);

  // ==========================
  // 6. FOOTER
  // ==========================
  doc
    .moveTo(leftMargin, 790)
    .lineTo(rightEdge, 790)
    .strokeColor('#CBD5E1')
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor('#94A3B8')
    .fontSize(8)
    .font('Helvetica')
    .text('1', rightEdge - 10, 795);

  doc.end();
};
