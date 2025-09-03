 const ForgetTemplate = (link,fullname) => {
    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .email-container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 6px;
      padding: 30px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
    }

    .header {
      text-align: center;
      padding-bottom: 20px;
    }

    .header h1 {
      color: #333333;
    }

    .message {
      color: #555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }

    .button-container {
      text-align: center;
    }

    .reset-button {
      background-color: #007bff;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      display: inline-block;
    }

    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #888;
      text-align: center;
    }

    @media (max-width: 600px) {
      .email-container {
        padding: 20px;
      }

      .reset-button {
        width: 100%;
        padding: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Password Reset</h1>
    </div>
    <div class="message">
      <p>Hi ${fullname},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
    </div>
    <div class="button-container">
    <a href="${link}" class="reset-button">Reset Password</a>
    </div>
    <div class="message">
      <p>If you didn’t request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>This link will expire in 30 minutes.</p>
    </div>
    <div class="footer">
      &copy; Design accent Your Company. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}


module.exports = { ForgetTemplate };