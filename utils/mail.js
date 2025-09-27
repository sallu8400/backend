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

// const nodemailer = require('nodemailer');
// const { ForgetTemplate } = require('./template');

// const SendEmail = async (sender, title, link, fullname) => {
//   try {
//     // ❌ service: "gmail" का उपयोग न करें
//     // ✅ यह स्पष्ट (explicit) कॉन्फ़िगरेशन हमेशा काम करता है
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',      // Gmail का SMTP सर्वर
//       port: 587,                 // <-- YEH BADLAAV KAREIN
//       secure: false,            // port 587 के लिए false होता है
//       auth: {
//         user: process.env.SMTP_EMAIL, // आपका पूरा ईमेल
//         pass: process.env.SMTP_PASS,  // आपका 16-अक्षरों वाला App Password
//       },
//     });

//     const mailOptions = {
//       from: `"Your App Name" <${process.env.SMTP_EMAIL}>`, // यूज़र को एक अच्छा नाम दिखाएँ
//       to: sender,
//       subject: title,
//       html: ForgetTemplate(link, fullname),
//     };

//     // ईमेल भेजने का प्रयास करें
//     await transporter.sendMail(mailOptions);
//     console.log(`Email successfully sent to ${sender}`);
//     return true;

//   } catch (error) {
//     // एरर को विस्तार से लॉग करें
//     console.error('Failed to send email. Full Error:', error);
//     return false;
//   }
// };

// module.exports = { SendEmail };
// email.js

// email.js

// 1. SendGrid की लाइब्रेरी को import करें
const sgMail = require('@sendgrid/mail');
// 2. अपने ईमेल टेम्पलेट को import करें (यह पहले जैसा ही रहेगा)
const { ForgetTemplate } = require('./template');

// 3. SendGrid को अपनी API Key बताएं
//    हम Render के SMTP_PASS variable से ही API Key पढ़ रहे हैं
sgMail.setApiKey(process.env.SMTP_PASS);

// 4. पूरा SendEmail function
const SendEmail = async (sender, title, link, fullname) => {
  // try...catch ब्लॉक किसी भी एरर को पकड़ने के लिए
  try {
    // ईमेल का पूरा मैसेज ऑब्जेक्ट बनाएँ
    const msg = {
      to: sender, // जिसे ईमेल भेजना है (e.g., 'test@example.com')

      // 🚨 ज़रूरी: यह ईमेल आपके SendGrid अकाउंट में "Verified Sender" होना चाहिए
      from: process.env.SMTP_EMAIL,

      subject: title, // ईमेल का विषय
      html: ForgetTemplate(link, fullname), // ईमेल का कंटेंट
    };

    // ईमेल भेजने का प्रयास करें
    await sgMail.send(msg);

    // अगर सफल हो, तो console में log करें और true return करें
    console.log(`Email successfully sent to ${sender} using SendGrid!`);
    return true;

  } catch (error) {
    // --------------------------------------------------------------------
    // अगर ईमेल भेजने में कोई भी समस्या आती है, तो यह हिस्सा चलेगा
    // --------------------------------------------------------------------

    // 1. console में एक सामान्य एरर मैसेज दिखाएँ
    console.error('Failed to send email using SendGrid. Full Error:', error);

    // 2. SendGrid से मिले असली एरर को दिखाएँ (यह सबसे महत्वपूर्ण है)
    //    असली कारण यहीं पता चलेगा (e.g., "Permission Denied", "Email is not a verified sender")
    if (error.response) {
      console.error("SendGrid's detailed error response:", error.response.body);
    }

    // 3. false return करें ताकि आपके controller को पता चले कि ईमेल फेल हो गया
    return false;
  }
};

// 5. इस function को export करें ताकि दूसरी फाइलों में इस्तेमाल हो सके
module.exports = { SendEmail };