// middleware/RazopayGuard.js
const crypto = require('crypto');

const RazopayGuard = (req, res, next) => {
  const webhookSecret = process.env.RAZO_HOOK;
  const razorpaySignature = req.headers['x-razorpay-signature'];

  if (!razorpaySignature || !webhookSecret) {
    return res.status(400).json({ status: 'failure', message: 'Signature ya Secret missing' });
  }

  try {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    
    // YEH RAW BODY PAR CHALEGA
    shasum.update(req.body);
    
    const digest = shasum.digest('hex');

    if (digest === razorpaySignature) {
      console.log("Signature Verified Successfully!");
      // CONTROLLER KE LIYE BODY KO WAPAS JSON BANAYEIN
      req.body = JSON.parse(req.body);
      // AAGE BADHNE KE LIYE NEXT() CALL KAREIN
      next();
    } else {
      console.error('Signature Mismatch! Check your Webhook Secret.');
      return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Signature verification failed' });
  }
};

module.exports = RazopayGuard;