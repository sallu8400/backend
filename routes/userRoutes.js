const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserStats
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

// Protected routes (require authentication)
router.get('/profile', auth, getUserById);
router.put('/profile', auth, updateUserValidation, updateUser);
router.get('/orders', auth, getUserOrders);
router.get('/stats', auth, getUserStats);

// Admin routes
router.get('/', auth, admin, getAllUsers);
router.get('/:id', auth, admin, getUserById);
router.put('/:id', auth, admin, updateUserValidation, updateUser);
router.delete('/:id', auth, admin, deleteUser);

module.exports = router;