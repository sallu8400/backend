const jwt = require('jsonwebtoken');

exports.verifyResetToken = (req, res, next) => {
  const token = req.query.token || req.body.token;
console.log(token,"query")
  if (!token) {
    return res.status(400).json({ message: 'Reset token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.FORGET_TOKEN); // different secret
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired reset token' });
  }
};
