const nodemailer = require('nodemailer');

const sendTicketEmail = async (customerEmail, customerName, eventTitle, ticketPdfBuffer) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Walk With Us" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `Your Ticket for ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1a3436; text-align: center;">Hello ${customerName}!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #1e293b;">
            Thank you for registering for <strong>${eventTitle}</strong>. We are excited to have you join us!
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #1e293b;">
            Attached to this email is your official event ticket. Please keep it safe and bring it with you (either printed or on your phone) to the event.
          </p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #475569;">Event Details:</p>
            <p style="margin: 10px 0; font-size: 18px; color: #1a3436;">${eventTitle}</p>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 40px;">
            This is an automated email. Please do not reply directly to this address.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: ticketPdfBuffer,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Ticket Email Sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

module.exports = { sendTicketEmail };
