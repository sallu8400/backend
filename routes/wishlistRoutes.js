const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(auth);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/:itemId', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;