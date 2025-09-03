const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  addAddress,
  fetchaddress,
  deleteAddress,
  sessionpassword,
  getMe,
  ResetPassword,
  updateAddress,
  updateProfile,
  changePassword,
  logout,
  ProfileUpload,
  ForgetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { verifyResetToken } = require('../middleware/verifyResetToken');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/profileUpload', auth, ProfileUpload);
router.put('/change-password', auth, changePassword);
router.post('/logout', logout);
router.post('/address',auth, addAddress);
router.get('/address',auth, fetchaddress);
router.delete('/address/delete/:id',auth, deleteAddress);
router.put('/address/update/:id', auth,updateAddress);

// forget pasword
router.post('/forget-password',ForgetPassword);
router.post('/forget-session',sessionpassword);
router.post('/reset-password',verifyResetToken,ResetPassword);

// router.post('/address/add', );

module.exports = router;