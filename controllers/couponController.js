// controllers/couponController.js
const Coupon = require("../models/Coupon");

// Create new coupon
const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Apply coupon on cart
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    console.log(coupon)

    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon" });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ success: false, message: "Coupon expired" });
    if (cartTotal < (coupon.minAmount || 0)) {
      return res.status(400).json({ success: false, message: `Minimum cart amount ${coupon.minAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = cartTotal - discount;

    res.json({
      success: true,
      discount,
      finalAmount,
      coupon: coupon.code,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createCoupon, getCoupons, applyCoupon };
