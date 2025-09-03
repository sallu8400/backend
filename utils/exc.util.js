const Exc = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    res.status(500).json({
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'failed! please try after sometime',
    });
  });
};

module.exports = Exc;
