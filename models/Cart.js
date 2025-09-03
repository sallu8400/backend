const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    size: String,
    color: String,
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  // Total quantity of all items (for backend logic if needed)
  this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);

  // Total amount of cart
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Total distinct items (for cart badge)
  this.totalItems = this.items.length;

  next();
});


module.exports = mongoose.model('Cart', cartSchema);