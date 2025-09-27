// const nodemailer = require('nodemailer');
// const { ForgetTemplate } = require('./template');

// const SendEmail = async (sender, title, link, fullname) => {
//   try {
//     const config = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.SMTP_EMAIL,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     const option = {
//       from: process.env.SMTP_EMAIL,
//       to: sender,
//       subject: title,
//       html: ForgetTemplate(link, fullname),
//     };

//     await config.sendMail(option);
//     return true;
//   } catch (error) {
//     console.error('Email error:', error);
//     return false;
//   }
// };

// module.exports = { SendEmail };

const nodemailer = require('nodemailer');
const { ForgetTemplate } = require('./template');

const SendEmail = async (sender, title, link, fullname) => {
  try {
    // ❌ service: "gmail" का उपयोग न करें
    // ✅ यह स्पष्ट (explicit) कॉन्फ़िगरेशन हमेशा काम करता है
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',      // Gmail का SMTP सर्वर
   port: 587,                 // <-- YEH BADLAAV KAREIN
      secure: false,             // port 587 के लिए false होता है
      auth: {
        user: process.env.SMTP_EMAIL, // आपका पूरा ईमेल
        pass: process.env.SMTP_PASS,  // आपका 16-अक्षरों वाला App Password
      },
    });

    const mailOptions = {
      from: `"Your App Name" <${process.env.SMTP_EMAIL}>`, // यूज़र को एक अच्छा नाम दिखाएँ
      to: sender,
      subject: title,
      html: ForgetTemplate(link, fullname),
    };

    // ईमेल भेजने का प्रयास करें
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${sender}`);
    return true;

  } catch (error) {
    // एरर को विस्तार से लॉग करें
    console.error('Failed to send email. Full Error:', error);
    return false;
  }
};

module.exports = { SendEmail };