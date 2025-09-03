// routes/couponRoutes.js
const express = require("express");
const { createCoupon, getCoupons, applyCoupon } = require("../controllers/couponController");
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);
router.post("/create", createCoupon);   // Admin only (later auth laga sakte ho)
router.get("/", getCoupons);            // Get all coupons
router.post("/apply", applyCoupon);     // Apply coupon

module.exports = router;
