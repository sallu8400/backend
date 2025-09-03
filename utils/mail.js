const nodemailer = require('nodemailer');
const { ForgetTemplate } = require('./template');

const SendEmail = async (sender, title, link, fullname) => {
  try {
    const config = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const option = {
      from: process.env.SMTP_EMAIL,
      to: sender,
      subject: title,
      html: ForgetTemplate(link, fullname),
    };

    await config.sendMail(option);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

module.exports = { SendEmail };
