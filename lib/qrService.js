const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Generate a secure, signed QR code payload.
 * Payload includes ticket ID, event ID, and an HMAC signature.
 */
const generateSignedPayload = (ticketId, eventId) => {
  const data = JSON.stringify({ t: ticketId, e: eventId });
  const signature = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(data)
    .digest('hex');

  return JSON.stringify({ 
    t: ticketId, 
    e: eventId, 
    s: signature.substring(0, 16) // Shortened signature for smaller QR
  });
};

/**
 * Verify if a payload's signature is valid.
 */
const verifyPayload = (payload) => {
  try {
    const { t, e, s } = JSON.parse(payload);
    const data = JSON.stringify({ t, e });
    const expectedSignature = crypto
      .createHmac('sha256', process.env.QR_SECRET)
      .update(data)
      .digest('hex');

    return s === expectedSignature.substring(0, 16);
  } catch (error) {
    return false;
  }
};

/**
 * Generate a DataURL for a QR code image.
 */
const generateQRCodeImage = async (payload) => {
  try {
    return await QRCode.toDataURL(payload);
  } catch (err) {
    console.error('QR Generation Error:', err);
    throw err;
  }
};

module.exports = {
  generateSignedPayload,
  verifyPayload,
  generateQRCodeImage
};
