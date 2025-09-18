// controllers/couponController.js
const Coupon = require("../models/Coupon");
const Cart = require('../models/Cart');

// Create new coupon
// Coupon मॉडल को इम्पोर्ट करना न भूलें


const createCoupon = async (req, res) => {
  try {
    // 1. req.body से ज़रूरी फ़ील्ड्स निकालें
    const { code, discountValue, discountType, minAmount, expiryDate } = req.body;

    // 2. बेसिक वैलिडेशन: जाँचें कि ज़रूरी फ़ील्ड्स मौजूद हैं या नहीं
    if (!code || !discountValue || !discountType || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide code, discountValue, discountType, and expiryDate"
      });
    }

    // 3. कूपन कोड को हमेशा अपरकेस में सेव करें ताकि 'sale50' और 'SALE50' एक ही माने जाएँ
    const upperCaseCode = code.toUpperCase();

    // 4. जाँचें कि इस कोड का कूपन पहले से मौजूद तो नहीं है
    const existingCoupon = await Coupon.findOne({ code: upperCaseCode });
    if (existingCoupon) {
      return res.status(409).json({ // 409 Conflict एक अच्छा HTTP कोड है
        success: false,
        message: "A coupon with this code already exists."
      });
    }

    // 5. नया कूपन बनाएँ
    const newCoupon = await Coupon.create({
      code: upperCaseCode,
      discountValue,
      discountType,
      minAmount,
      expiryDate,
      // आप यहाँ isActive जैसे डिफ़ॉल्ट मान भी सेट कर सकते हैं
      // isActive: true 
    });

    res.status(201).json({ success: true, coupon: newCoupon });

  } catch (err) {
    // Mongoose के वैलिडेशन एरर को बेहतर तरीके से हैंडल करें
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Get all coupons
const getCoupons = async (req, res) => {
  try {
    // 1. फ़िल्टरिंग के लिए क्वेरी पैरामीटर (query parameters) का उपयोग करें
    // उदाहरण: /api/coupons?isActive=true
    const filter = {};
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }

    // 2. डेटाबेस से कूपन प्राप्त करें
    // .sort() का उपयोग करके आप उन्हें किसी खास क्रम में दिखा सकते हैं, जैसे सबसे नया पहले
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    // 3. अगर कोई कूपन नहीं मिलता है तो एक खाली ऐरे के साथ सफल रिस्पॉन्स भेजें
    res.json({
      success: true,
      count: coupons.length, // कूपनों की संख्या भेजना एक अच्छी प्रैक्टिस है
      coupons
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Apply coupon on cart
// const applyCoupon = async (req, res) => {
//   try {
//     const { code, cartTotal } = req.body;
//     const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

//     console.log(coupon)

//     if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon" });
//     if (coupon.expiryDate < new Date()) return res.status(400).json({ success: false, message: "Coupon expired" });
//     if (cartTotal < (coupon.minAmount || 0)) {
//       return res.status(400).json({ success: false, message: `Minimum cart amount ${coupon.minAmount}` });
//     }

//     let discount = 0;
//     if (coupon.discountType === "percent") {
//       discount = (cartTotal * coupon.discountValue) / 100;
//     } else {
//       discount = coupon.discountValue;
//     }

//     const finalAmount = cartTotal - discount;

//     res.json({
//       success: true,
//       discount,
//       finalAmount,
//       coupon: coupon.code,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id; // Auth middleware से

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ success: false, message: "Your cart is empty." });
    }
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code." });
    }
    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal < (coupon.minAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart amount must be ${coupon.minAmount} to apply this coupon.`
      });
    }

    // बस कूपन कोड को कार्ट में सेट करें
    cart.appliedCoupon = coupon.code;
    
    // कार्ट को सेव करें (यह 'pre' हुक को ट्रिगर करेगा जो सारी गणना करेगा)
    await cart.save();

    res.json({
      success: true,
      message: "Coupon applied successfully!",
      cart: cart // पूरा अपडेटेड कार्ट भेजें
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createCoupon, getCoupons, applyCoupon };
