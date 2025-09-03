// routes/Pyament.route.js
const express = require('express');
const { generateOrder, fetchOrder, fetchAdmin } = require('../controllers/Payment.controller'); // Sirf generateOrder ki zaroorat hai
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/order', auth, generateOrder);
router.get('/fetch', auth, fetchOrder);
router.get('/fetchAdmin', auth, fetchAdmin);

// Yahaan se webhook route hata hona chahiye
// router.post('/webhook', ...); // <--- Yeh line nahi honi chahiye

module.exports = router;