const mongoose = require('mongoose'); // इसे फ़ाइल के टॉप पर जोड़ें
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product', 'name price images rating badge isActive');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(item => 
      item.product && item.product.isActive
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      count: wishlist.products.length, // 👈 wishlist count added
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
};


// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    wishlist.products.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('products.product', 'name price images rating badge isActive');

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
};

// Remove product from wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    // 📌 If no wishlist, create new only if productId is provided
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: [{ product: productId }]
      });
    } else {
      const exists = wishlist.products.find(p => p.product.toString() === productId);
      if (exists) {
        return res.status(400).json({ success: false, message: "Already in wishlist" });
      }

      wishlist.products.push({ product: productId });
    }

    await wishlist.save();
    await wishlist.populate("products.product", "name price images rating badge isActive");

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
    });
  }
};



// ✅ REMOVE FROM WISHLIST
// exports.removeFromWishlist = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     console.log("Removing productId:", productId);

//     const wishlist = await Wishlist.findOne({ user: req.user.id });

//     if (!wishlist) {
//       return res.status(404).json({
//         success: false,
//         message: "Wishlist not found",
//       });
//     }

//     const initialLength = wishlist.products.length;

//     wishlist.products = wishlist.products.filter(
//       item => item.product.toString() !== productId
//     );

//     // ❌ Don't save if product wasn't in the list
//     if (wishlist.products.length === initialLength) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found in wishlist"
//       });
//     }

//     await wishlist.save();
//     await wishlist.populate("products.product", "name price images rating badge isActive");

//     res.status(200).json({
//       success: true,
//       message: "Product removed from wishlist",
//       data: wishlist,
//     });
//   } catch (error) {
//     console.error("Remove from wishlist error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while removing from wishlist",
//     });
//   }
// };
// यह तरीका ज्यादा कुशल और सुरक्षित है
// wishlistController.js

exports.removeFromWishlist = async (req, res) => {
  // ----- यह लॉग हमें सब कुछ बता देगा -----
  console.log('--- INSIDE removeFromWishlist ---');
  console.log('req.params object:', req.params); 
  
  try {
    // अगर req.params.itemId मौजूद नहीं है, तो itemId undefined होगा
    const itemId = req.params.itemId ? req.params.itemId.trim() : undefined;
    
    console.log('Value of itemId variable:', itemId);

    // अब हम जांचेंगे कि itemId मौजूद है और वैलिड है या नहीं
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      console.log('Validation FAILED. itemId is invalid or missing.');
      return res.status(400).json({ success: false, message: "Invalid or Missing Item ID" });
    }
    
    // --- यहाँ से आगे का कोड तभी चलेगा जब ID वैलिड होगी ---
    console.log('Validation PASSED. Proceeding to delete.');
    
    const userId = req.user.id;

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { _id: new mongoose.Types.ObjectId(itemId) } } },
      { new: true }
    );

    if (!updatedWishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found or item already removed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist successfully!",
      data: updatedWishlist,
    });

  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    });
  }
};
// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: wishlist
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing wishlist'
    });
  }
};