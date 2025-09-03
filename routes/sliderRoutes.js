const express = require('express');
const { body } = require('express-validator');
const {
  getSliders,
  getAllSliders,
  createSlider,
  updateSlider,
  deleteSlider
} = require('../controllers/sliderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Validation rules
const sliderValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('image')
    .notEmpty()
    .withMessage('Image is required')
];

// Public routes
router.get('/', getSliders);

// Admin routes
router.get('/admin', auth, admin, getAllSliders);
router.post('/', auth, admin, sliderValidation, createSlider);
router.put('/:id', auth, admin, updateSlider);
router.delete('/:id', auth, admin, deleteSlider);

module.exports = router;