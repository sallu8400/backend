const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images isActive');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check stock if size is specified
    if (size) {
      const sizeInfo = product.sizes.find(s => s.size === size);
      if (!sizeInfo || sizeInfo.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for selected size'
        });
      }
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        price: product.price
      });
    }

    // ✅ Update totals
    cart.totalItems = cart.items.length; // distinct items
    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0
    );

    await cart.save();
    await cart.populate('items.product', 'name price images isActive');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
};


// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;

    await cart.save(); // Save karne ke baad product sirf ID ban jaata hai

    // ✅✅ YEH LINE SABSE ZAROORI HAI ✅✅
    // Isse Mongoose ko bolte hain ki ab product ki ID ki jagah uski poori details daal do
    await cart.populate('items.product', 'name price images isActive');

    // Ab 'cart' mein product ki poori details hain
    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error while updating cart item' });
  }
};

// Remove item from cart
// backend/controllers/cartController.js

exports.removeFromCart = async (req, res) => {
  try {
    // 1. clarity के लिए इसका नाम itemId कर दें, क्योंकि यह कार्ट आइटम की आईडी है
    const { itemId } = req.params; 

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // ✅ यह सही तरीका है:
    // cart.items में से उस item को हटाओ जिसकी अपनी `_id` भेजी गई `itemId` से मेल खाती है।
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );
    
    await cart.save();
    
    // अपडेटेड कार्ट को populate करके वापस भेजें
    await cart.populate("items.product", "name price images isActive");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from cart"
    });
  }
};


// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};