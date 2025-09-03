const express = require('express');
const {
  getDashboardStats,
  getSalesData,
  getTopProducts,
  getRecentOrders,
  getUserAnalytics
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// All dashboard routes require admin access
router.use(auth, admin);

router.get('/stats', getDashboardStats);
router.get('/sales', getSalesData);
router.get('/top-products', getTopProducts);
router.get('/recent-orders', getRecentOrders);
router.get('/user-analytics', getUserAnalytics);

module.exports = router;