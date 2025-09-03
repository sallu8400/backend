const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all products with filtering, sorting, and pagination



// exports.getProducts = async (req, res) => {
//   try {
//     console.log(req.query, "Incoming Query Params");

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const skip = (page - 1) * limit;

//     // Base query
//     let query = { isActive: true };

//     // ✅ Category filter
//     if (req.query.category) {
//       query.category = req.query.category;
//     }

//     // ✅ Subcategory filter
//     if (req.query.subcategory) {
//       query.subcategory = req.query.subcategory;
//     }

//     // ✅ Price range filter
//     if (req.query.minPrice || req.query.maxPrice) {
//       query.price = {};
//       if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
//       if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
//     }

//     // ✅ Text search (requires text index in schema)
//     if (req.query.search) {
//       query.$text = { $search: req.query.search };
//     }

//     // ✅ Size filter
//     if (req.query.sizes) {
//       const sizes = req.query.sizes.split(',');
//       query.sizes = { $in: sizes };
//     }

//     // ✅ Color filter
//     if (req.query.colors) {
//       const colors = req.query.colors.split(',');
//       query.colors = { $in: colors };
//     }

//     // ✅ Badge filter (e.g. "Sale", "New")
//     if (req.query.badge) {
//       query.badge = req.query.badge;
//     }

//     // ✅ In-stock filter
//     if (req.query.inStock === 'true') {
//       query.inStock = true;
//     }

//     // ✅ Sorting
//     let sort = {};
//     switch (req.query.sort) {
//       case 'price-low':
//         sort.price = 1;
//         break;
//       case 'price-high':
//         sort.price = -1;
//         break;
//       case 'rating':
//         sort['rating.average'] = -1;
//         break;
//       case 'newest':
//         sort.createdAt = -1;
//         break;
//       default:
//         sort.createdAt = -1;
//     }

//     // Debug query
//     console.log("Final Query:", query);

//     // Query database
//     const products = await Product.find(query)
//       .sort(sort)
//       .skip(skip)
//       .limit(limit);

//     const total = await Product.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//       data: products,
//     });

//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching products',
//     });
//   }
// };

exports.getProducts = async (req, res) => {
  try {
    console.log(req.query, "Incoming Query Params");

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // Base query
    let query = { isActive: true };

    // ✅ Filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.subcategory) query.subcategory = req.query.subcategory;

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.search) query.$text = { $search: req.query.search };
    if (req.query.sizes) query.sizes = { $in: req.query.sizes.split(',') };
    if (req.query.colors) query.colors = { $in: req.query.colors.split(',') };
    if (req.query.badge) query.badge = req.query.badge;
    if (req.query.inStock === 'true') query.inStock = true;

    // ✅ Sorting
    let sort = {};
    switch (req.query.sort) {
      case 'price-low': sort.price = 1; break;
      case 'price-high': sort.price = -1; break;
      case 'rating': sort['rating.average'] = -1; break;
      case 'newest': sort.createdAt = -1; break;
      default: sort.createdAt = -1;
    }

    // Final Query debug
    console.log("Final Query:", query);

    let productsQuery = Product.find(query).sort(sort);

    // ✅ Only apply skip & limit if pagination is requested
    if (!isNaN(page) && !isNaN(limit)) {
      productsQuery = productsQuery.skip(skip).limit(limit);
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: page || 1,
      pages: limit ? Math.ceil(total / limit) : 1,
      data: products,
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
};


// Get single product
exports.getProduct = async (req, res) => {
  try {
    console.log(req.params.id,"req.params.id")
    const product = await Product.findById(req.params.id)
      // .populate('category', 'name slug')
      // .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    console.log(errors,"clg")
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const product = await Product.create(req.body);

    // YEH LINE HATA DI GAYI HAI
    // await product.populate('category', 'name slug'); 

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// Update product (Admin only)
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).populate('category', 'name slug');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Product updated successfully',
//       data: product
//     });
//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating product'
//     });
//   }
// };
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};
// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// Add product review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: userId,
      rating,
      comment
    });

    // Update rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
    .populate('category', 'name slug')
    .limit(20);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products'
    });
  }
};