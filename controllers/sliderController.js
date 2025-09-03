const Slider = require('../models/Slider');
const { validationResult } = require('express-validator');

// Get all active sliders
exports.getSliders = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const sliders = await Slider.find({
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ]
    }).sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sliders.length,
      data: sliders
    });
  } catch (error) {
    console.error('Get sliders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sliders'
    });
  }
};

// Get all sliders (Admin)
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sliders.length,
      data: sliders
    });
  } catch (error) {
    console.error('Get all sliders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sliders'
    });
  }
};

// Create slider (Admin)
exports.createSlider = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const slider = await Slider.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider
    });
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating slider'
    });
  }
};

// Update slider (Admin)
exports.updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slider updated successfully',
      data: slider
    });
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating slider'
    });
  }
};

// Delete slider (Admin)
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting slider'
    });
  }
};