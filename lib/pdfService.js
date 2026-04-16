const PDFDocument = require('pdfkit');

/**
 * Generate a high-fidelity PDF ticket for a booking.
 * @param {Object} booking - The booking object.
 * @param {Object} event - The event object.
 * @param {string} qrDataUrl - The DataURL of the generated QR code.
 * @returns {Promise<Buffer>} - Buffer of the PDF.
 */
const generateTicketPDF = (booking, event, qrDataUrl) => {
   return new Promise((resolve, reject) => {
      try {
         // Create document in landscape-like format for ticket aesthetic
         const doc = new PDFDocument({ size: [600, 320], margin: 0 });
         const chunks = [];

         doc.on('data', chunk => chunks.push(chunk));
         doc.on('end', () => resolve(Buffer.concat(chunks)));

         // --- COLORS & STYLES ---
         const primaryColor = '#1a3436'; // Dark Teal
         const accentColor = '#b7ff8e'; // Lime Green
         const textColor = '#1e293b';
         const mutedColor = '#64748b';

         // --- BACKGROUND & BORDER ---
         doc.rect(0, 0, 600, 320).fill('#ffffff');

         // Sidebar/Header Accent
         doc.rect(0, 0, 180, 320).fill(primaryColor);

         // --- LOGO & BRANDING (SIDEBAR) ---
         doc.fillColor(accentColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('ELITE EVENT PASS', 20, 40, { characterSpacing: 2 });

         doc.fillColor('#ffffff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('Walk', 20, 80)
            .text('With Us', 20, 110);

         doc.fillColor('rgba(255,255,255,0.4)')
            .fontSize(8)
            .font('Helvetica')
            .text('COMMUNITY • SPIRIT • GROWTH', 20, 150);

         // Ticket Number Vertically
         doc.save();
         doc.fillColor('rgba(255,255,255,0.2)')
            .fontSize(30)
            .font('Helvetica-Bold')
            .text(booking.ticketNumber, 30, 280);
         doc.restore();

         // --- MAIN TICKET CONTENT ---
         let currentY = 40;
         const contentX = 210;

         // Event Title
         doc.fillColor(primaryColor)
            .fontSize(22)
            .font('Helvetica-Bold')
            .text(event.title.toUpperCase(), contentX, currentY, { width: 360 });

         currentY += doc.heightOfString(event.title) + 15;

         // Dashed Separator
         doc.strokeColor('#e2e8f0')
            .dash(5, { space: 2 })
            .moveTo(contentX, currentY)
            .lineTo(570, currentY)
            .stroke();

         currentY += 15;

         // Details Columns
         const col1X = contentX;
         const col2X = contentX + 180;

         // Row 1: Date & Time
         doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('DATE', col1X, currentY);
         doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('TIME', col2X, currentY);
         currentY += 12;
         doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text(event.date, col1X, currentY);
         doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text(event.time, col2X, currentY);

         currentY += 30;

         // Row 2: Location & Price
         doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('LOCATION', col1X, currentY);
         doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('PRICE', col2X, currentY);
         currentY += 12;
         doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(event.location, col1X, currentY, { width: 170 });
         doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text(event.price === 0 ? 'FREE' : `$${event.price}`, col2X, currentY);

         currentY += 40;

         // Row 3: Attendee
         doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('ATTENDEE', col1X, currentY);
         currentY += 12;
         doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(booking.customerName.toUpperCase(), col1X, currentY);

         // --- QR CODE (RIGHT ALIGNED) ---
         const qrSize = 90;
         doc.image(qrDataUrl, 480, 200, { width: qrSize });

         // Ticket ID label near QR
         doc.fillColor(mutedColor)
            .fontSize(7)
            .font('Helvetica')
            .text(`REF: ${booking.ticketNumber}`, 480, 295, { width: qrSize, align: 'center' });

         // --- DECORATIVE ELEMENTS ---
         // Scalloped edges (circles) to look like a ticket
         doc.circle(180, 0, 10).fill('white');
         doc.circle(180, 320, 10).fill('white');

         // Vertical dashed line for tear-off look
         doc.strokeColor('#e2e8f0')
            .dash(5, { space: 3 })
            .moveTo(180, 10)
            .lineTo(180, 310)
            .stroke();

         doc.end();
      } catch (error) {
         reject(error);
      }
   });
};

module.exports = { generateTicketPDF };
