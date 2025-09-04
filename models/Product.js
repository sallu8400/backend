// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true,
//     maxlength: [100, 'Product name cannot exceed 100 characters']
//   },
//   description: {
//     type: String,
//     required: [true, 'Product description is required'],
//     maxlength: [2000, 'Description cannot exceed 2000 characters']
//   },
//   price: {
//     type: Number,
//     required: [true, 'Product price is required'],
//     min: [0, 'Price cannot be negative']
//   },
//   originalPrice: {
//     type: Number,
//     default: null
//   },
//   images: [{
//     url: {
//       type: String,
//       required: true
//     },
//     alt: String,
//     isPrimary: {
//       type: Boolean,
//       default: false
//     }
//   }],
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Product category is required']
//   },
//   subcategory: {
//     type: String,
//     trim: true
//   },
//   brand: {
//     type: String,
//     trim: true
//   },
//   sku: {
//     type: String,
//     unique: true,
//     required: [true, 'SKU is required']
//   },
//   sizes: [{
//     size: String,
//     stock: {
//       type: Number,
//       default: 0,
//       min: [0, 'Stock cannot be negative']
//     }
//   }],
//   colors: [String],
//   features: [String],
//   specifications: {
//     material: String,
//     careInstructions: String,
//     origin: String,
//     weight: Number
//   },
//   rating: {
//     average: {
//       type: Number,
//       default: 0,
//       min: [0, 'Rating cannot be less than 0'],
//       max: [5, 'Rating cannot be more than 5']
//     },
//     count: {
//       type: Number,
//       default: 0
//     }
//   },
//   reviews: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     rating: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 5
//     },
//     comment: String,
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   totalStock: {
//     type: Number,
//     default: 0,
//     min: [0, 'Stock cannot be negative']
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   tags: [String],
//   seoTitle: String,
//   seoDescription: String,
//   badge: {
//     type: String,
//     enum: ['New', 'Sale', 'Trending', 'Limited', null],
//     default: null
//   }
// }, {
//   timestamps: true
// });

// // Index for search functionality
// productSchema.index({
//   name: 'text',
//   description: 'text',
//   brand: 'text',
//   tags: 'text'
// });

// // Calculate total stock from sizes
// productSchema.pre('save', function(next) {
//   if (this.sizes && this.sizes.length > 0) {
//     this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
//   }
//   next();
// });

// module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
      isPrimary: { type: Boolean, default: false }
    }
  ],
  category: { type: String, required: true }, // example: "men", "women"
  features: [String],
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
  colors: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  badge: {
    type: String,
    enum: ['New', 'Sale', 'Trending', 'Limited', null],
    default: null
  },
  inStock: { type: Boolean, default: true },
  sku: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', category: 'text' });
module.exports = mongoose.model('Product', productSchema);
