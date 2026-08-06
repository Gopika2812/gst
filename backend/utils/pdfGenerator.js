const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF Stream
 */
exports.generateInvoicePDF = (invoice, client, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);

  doc.pipe(res);

  // Header Banner - Vignesh Associates Navy Blue
  doc
    .rect(0, 0, 612, 90)
    .fill('#0F2B48');

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('VIGNESH ASSOCIATES', 50, 25);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('CHARTERED ACCOUNTANTS & TAX CONSULTANTS', 50, 52)
    .text('GST | INCOME TAX | AUDIT | BOOK KEEPING | REGISTRATION', 50, 65);

  // Invoice Title Right Aligned
  doc
    .fillColor('#52A636')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 400, 30, { align: 'right' });

  // Bill To & Invoice Info Box
  doc.moveDown(3);
  const startY = 110;

  doc
    .fillColor('#0F2B48')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Billed To:', 50, startY);

  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica')
    .text(client.clientName || 'Valued Client', 50, startY + 18)
    .text(client.tradeName ? `Trade: ${client.tradeName}` : '', 50, startY + 30)
    .text(`GSTIN: ${client.gstin || 'N/A'}`, 50, startY + 42)
    .text(`PAN: ${client.pan || 'N/A'}`, 50, startY + 54)
    .text(`Phone: ${client.phone || 'N/A'}`, 50, startY + 66);

  // Invoice Details Side Table
  doc
    .fillColor('#0F2B48')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Invoice No:`, 380, startY)
    .font('Helvetica')
    .text(`${invoice.invoiceNumber}`, 470, startY)
    .font('Helvetica-Bold')
    .text(`Date:`, 380, startY + 15)
    .font('Helvetica')
    .text(`${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 470, startY + 15)
    .font('Helvetica-Bold')
    .text(`Service:`, 380, startY + 30)
    .font('Helvetica')
    .text(`${invoice.serviceType}`, 470, startY + 30)
    .font('Helvetica-Bold')
    .text(`Status:`, 380, startY + 45)
    .fillColor(invoice.paymentStatus === 'Paid' ? '#52A636' : '#D97706')
    .text(`${invoice.paymentStatus}`, 470, startY + 45);

  // Table Headers
  const tableTop = 220;
  doc
    .rect(50, tableTop, 512, 25)
    .fill('#0F2B48');

  doc
    .fillColor('#FFFFFF')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('S.No', 60, tableTop + 7)
    .text('Description of Service', 110, tableTop + 7)
    .text('Amount (₹)', 460, tableTop + 7, { align: 'right' });

  let yPos = tableTop + 35;
  invoice.items.forEach((item, index) => {
    doc
      .fillColor('#333333')
      .fontSize(10)
      .font('Helvetica')
      .text(`${index + 1}`, 60, yPos)
      .text(`${item.description}`, 110, yPos)
      .text(`₹ ${item.amount.toLocaleString('en-IN')}`, 460, yPos, { align: 'right' });

    yPos += 22;
  });

  // Divider Line
  doc
    .moveTo(50, yPos + 10)
    .lineTo(562, yPos + 10)
    .stroke('#E2E8F0');

  // Summary Totals
  const summaryTop = yPos + 25;

  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica')
    .text('Subtotal:', 350, summaryTop)
    .text(`₹ ${invoice.subTotal.toLocaleString('en-IN')}`, 460, summaryTop, { align: 'right' })
    .text(`GST (${invoice.gstPercent}%):`, 350, summaryTop + 18)
    .text(`₹ ${invoice.gstAmount.toLocaleString('en-IN')}`, 460, summaryTop + 18, { align: 'right' })
    .text(`Discount:`, 350, summaryTop + 36)
    .text(`- ₹ ${invoice.discount.toLocaleString('en-IN')}`, 460, summaryTop + 36, { align: 'right' });

  doc
    .rect(340, summaryTop + 55, 222, 30)
    .fill('#52A636');

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Total Payable:', 350, summaryTop + 63)
    .text(`₹ ${invoice.total.toLocaleString('en-IN')}`, 460, summaryTop + 63, { align: 'right' });

  // Bank & Footer Info
  doc
    .fillColor('#0F2B48')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Bank Transfer Details:', 50, summaryTop + 100)
    .font('Helvetica')
    .fillColor('#555555')
    .text('Bank Name: HDFC Bank', 50, summaryTop + 115)
    .text('Account Name: Vignesh Associates', 50, summaryTop + 128)
    .text('Account Number: 50200088991122', 50, summaryTop + 141)
    .text('IFSC Code: HDFC0001234', 50, summaryTop + 154);

  doc
    .fillColor('#888888')
    .fontSize(9)
    .text('Thank you for choosing Vignesh Associates! This is a computer-generated tax invoice.', 50, 720, { align: 'center' });

  doc.end();
};
