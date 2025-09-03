// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   orderNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   items: [{
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true
//     },
//     name: String,
//     image: String,
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     size: String,
//     color: String,
//     price: {
//       type: Number,
//       required: true
//     }
//   }],
//   shippingAddress: {
//     name: String,
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: String,
//     phone: String
//   },
//   billingAddress: {
//     name: String,
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: String
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['card', 'paypal', 'cod'],
//     required: true
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   orderStatus: {
//     type: String,
//     enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },
//   subtotal: {
//     type: Number,
//     required: true
//   },
//   shippingCost: {
//     type: Number,
//     default: 0
//   },
//   tax: {
//     type: Number,
//     default: 0
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   trackingNumber: String,
//   estimatedDelivery: Date,
//   deliveredAt: Date,
//   notes: String
// }, {
//   timestamps: true
// });

// // Generate order number before saving
// orderSchema.pre('save', function(next) {
//   if (!this.orderNumber) {
//     this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);

// const mongoose = require('mongoose');
// const { Schema, model } = mongoose;

// const orderSchema = new Schema(
//   {
//     user: {
//       type: mongoose.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Multiple ebookIds
//     ebookIds: [
//       {
//         type: mongoose.Types.ObjectId,
//         ref: "Ebook",
//         required: true,
//       }
//     ],

//     paymentId: {
//       type: String,
//       required: true,
//     },

//     discount: {
//       type: Number,
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["success", "failed"],
//     },
//   },
//   { timestamps: true }
// );

// const OrderModel = model('Order', orderSchema);
// module.exports = OrderModel;
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    // === YAHAN BADLAAV KIYA GAYA HAI ===
    orderNumber: {
      type: String,
      required: true,
      unique: true, // Sunishchit karein ki har order number unique ho
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ebookIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Ebook",
        required: true,
      }
    ],

    paymentId: {
      type: String,
      required: true,
    },

    discount: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending", "dispatched", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const OrderModel = model('Order', orderSchema);
module.exports = OrderModel;