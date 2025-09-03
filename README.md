# E-commerce Backend API

A comprehensive Node.js backend API for an e-commerce platform with MongoDB, AWS S3 integration, and JWT authentication.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Profile management

- **Product Management**
  - CRUD operations for products
  - Category-based filtering
  - Search functionality
  - Product reviews and ratings
  - Image upload to AWS S3

- **Shopping Cart & Wishlist**
  - Add/remove items from cart
  - Update quantities
  - Persistent cart storage
  - Wishlist management

- **Order Management**
  - Order creation and tracking
  - Order status updates
  - Order history

- **Admin Dashboard**
  - Product management
  - User management
  - Order management
  - Analytics

- **Image Management**
  - AWS S3 integration for image storage
  - Automatic image optimization
  - Secure file uploads

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-ecommerce-bucket
FRONTEND_URL=http://localhost:3000
```

5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `POST /api/products/:id/reviews` - Add product review

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist
- `DELETE /api/wishlist` - Clear wishlist

### Slider
- `GET /api/slider` - Get active sliders
- `GET /api/slider/admin` - Get all sliders (Admin)
- `POST /api/slider` - Create slider (Admin)
- `PUT /api/slider/:id` - Update slider (Admin)
- `DELETE /api/slider/:id` - Delete slider (Admin)

## Database Models

### User
- Personal information (name, email, phone, address)
- Authentication (password, role)
- Profile management

### Product
- Product details (name, description, price, images)
- Category and subcategory
- Inventory management (sizes, colors, stock)
- Reviews and ratings
- SEO fields

### Category
- Hierarchical category structure
- SEO optimization
- Image support

### Cart
- User-specific cart items
- Quantity and pricing
- Automatic total calculation

### Wishlist
- User-specific product wishlist
- Easy add/remove functionality

### Order
- Complete order information
- Shipping and billing addresses
- Payment and order status tracking
- Order history

### Slider
- Homepage slider management
- Image and content management
- Active/inactive status

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Express validator for request validation
- **Error Handling**: Comprehensive error handling middleware

## AWS S3 Integration

The API includes AWS S3 integration for image storage:

- Automatic file upload to S3
- Public URL generation
- File type validation
- Size limits
- Secure file deletion

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Code Structure
```
backend/
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── config/         # Configuration files
└── server.js       # Main server file
```

## Deployment

1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure AWS S3 bucket
3. Set production environment variables
4. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.