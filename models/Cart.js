// const mongoose = require('mongoose');

// const cartSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   items: [{
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: [1, 'Quantity must be at least 1']
//     },
//     size: String,
//     color: String,
//     price: {
//       type: Number,
//       required: true
//     }
//   }],
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
//   totalItems: {
//     type: Number,
//     default: 0
//   },

//   discount:{
//     type:Number,
//     default:0

//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// cartSchema.pre('save', function (next) {
//   // Total quantity of all items (for backend logic if needed)
//   this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);

//   // Total amount of cart
//   this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);

//   // Total distinct items (for cart badge)
//   this.totalItems = this.items.length;

//   next();
// });


// module.exports = mongoose.model('Cart', cartSchema);
// cart.js (आपका मॉडल)

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    // ... आपके आइटम फ़ील्ड्स ...
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
      price: { type: Number, required: true },
      // ... size, color, etc.
    }
  ],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  // नया: लागू किए गए कूपन का कोड यहाँ सेव करें
  appliedCoupon: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Calculate totals before saving (पूरी तरह से संशोधित और सही लॉजिक)
cartSchema.pre('save', async function(next) {
  // पहले Coupon मॉडल को इम्पोर्ट करें
  const Coupon = mongoose.model('Coupon');

  // 1. आइटम्स का सबटोटल निकालें
  const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.totalItems = this.items.length;
  
  // 2. अगर कोई कूपन लागू है, तो डिस्काउंट की फिर से गणना करें
  if (this.appliedCoupon) {
    const coupon = await Coupon.findOne({ code: this.appliedCoupon, isActive: true });

    // अगर कूपन वैध है और न्यूनतम राशि की शर्त पूरी होती है
    if (coupon && subtotal >= (coupon.minAmount || 0) && coupon.expiryDate >= new Date()) {
      if (coupon.discountType === 'percent') {
        this.discount = (subtotal * coupon.discountValue) / 100;
      } else { // 'fixed'
        this.discount = coupon.discountValue;
      }
    } else {
      // अगर कूपन अब मान्य नहीं है (जैसे, सबटोटल कम हो गया), तो उसे हटा दें
      this.discount = 0;
      this.appliedCoupon = null;
    }
  } else {
    // कोई कूपन नहीं है तो डिस्काउंट 0 है
    this.discount = 0;
  }

  // 3. फाइनल टोटल अमाउंट की गणना करें
  this.totalAmount = subtotal - this.discount;

  // सुनिश्चित करें कि टोटल 0 से कम न हो
  if (this.totalAmount < 0) {
    this.totalAmount = 0;
  }

  next();
});

module.exports = mongoose.model('Cart', cartSchema);