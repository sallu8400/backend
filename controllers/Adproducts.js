const Product = require('../models/Product');
exports.AddproductDumm = async (req, res) => {
   try {
    await Product.insertMany(req.body);
    res.json({ success: true, message: "Bulk products inserted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};