# E-Commerce API

A complete e-commerce backend API built with Node.js, Express, and MongoDB. This API provides comprehensive product and category management with support for multiple product types including clothing, electronics, beauty, fashion, shoes, books, sports, and furniture.

## 🚀 Features

- **Product Management**: Full CRUD operations for products
- **Category Management**: Hierarchical category system
- **Advanced Filtering**: Filter by category, price, brand, size, color, etc.
- **Search Functionality**: Text-based search across products
- **Image Upload**: Support for multiple product images
- **Pagination**: Efficient pagination for large datasets
- **Validation**: Comprehensive input validation
- **Error Handling**: Robust error handling and logging
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing enabled

## 📁 Project Structure

```
youtube/
├── config/
│   ├── db.js               # Database configuration
│   └── s3.js               # AWS S3 configuration
├── controllers/
│   ├── adminController/
│   │   └── adminController.js  # Admin CRUD operations
│   ├── userController/
│   │   └── userController.js   # User CRUD operations
│   ├── productController/
│   │   └── productController.js # Product CRUD operations
│   └── bannerController.js     # Banner CRUD operations
├── middleware/
│   └── authMiddleware.js   # Authentication middleware
├── models/
│   ├── admin/
│   │   └── Admin.js        # Admin schema
│   ├── user/
│   │   └── User.js         # User schema
│   ├── product/
│   │   └── Product.js      # Product schema
│   └── Banner.js           # Banner schema
├── routes/
│   ├── admin/
│   │   ├── adminRoute.js   # Admin routes
│   │   └── bannerRoutes.js # Banner routes
│   ├── user/
│   │   └── userRoutes.js   # User routes
│   └── products/
│       └── productRoutes.js # Product routes
├── utils/
│   └── s3Upload.js         # AWS S3 upload utilities
├── scripts/
│   └── createAdmin.js      # Admin creation script
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
├── package-lock.json       # Lock file
└── README.md              # Project documentation
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /health
```

### Product Endpoints

#### Get All Products
```
GET /products
```
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `size` (string): Filter by size
- `color` (string): Filter by color
- `material` (string): Filter by material
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order 'asc' or 'desc' (default: 'desc')
- `search` (string): Search query
- `tags` (string): Comma-separated tags
- `isFeatured` (boolean): Filter featured products

**Example:**
```
GET /products?category=clothing&minPrice=20&maxPrice=100&sortBy=price&sortOrder=asc
```

#### Get Product by ID
```
GET /products/:id
```

#### Get Product by Slug
```
GET /products/slug/:slug
```

#### Get Products by Category
```
GET /products/category/:category
```

#### Get Featured Products
```
GET /products/featured?limit=8
```

#### Search Products
```
GET /products/search?q=smartphone&page=1&limit=12
```

#### Create Product
```
POST /products
```
**Body (multipart/form-data):**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "originalPrice": 129.99,
  "category": "electronics",
  "subcategory": "smartphones",
  "brand": "Brand Name",
  "stock": 50,
  "size": "M",
  "color": "Black",
  "material": "Plastic",
  "tags": "electronics,smartphone,5G",
  "warranty": "2 years",
  "images": [files]
}
```

#### Update Product
```
PUT /products/:id
```

#### Delete Product
```
DELETE /products/:id
```

#### Get Product Statistics
```
GET /products/stats/overview
```

### Category Endpoints

#### Get All Categories
```
GET /categories
```

#### Get Category Tree
```
GET /categories/tree
```

#### Get Featured Categories
```
GET /categories/featured?limit=6
```

#### Get Category by ID
```
GET /categories/:id
```

#### Get Category by Slug
```
GET /categories/slug/:slug
```

#### Create Category
```
POST /categories
```
**Body (multipart/form-data):**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "parentCategory": "parent-category-id",
  "isFeatured": true,
  "sortOrder": 1,
  "image": [file]
}
```

#### Update Category
```
PUT /categories/:id
```

#### Delete Category
```
DELETE /categories/:id
```

#### Update Category Product Count
```
PUT /categories/:id/update-count
```

#### Update All Category Counts
```
PUT /categories/update-all-counts
```

#### Get Category Statistics
```
GET /categories/stats/overview
```

## 🗄️ Database Schema

### Product Schema
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  originalPrice: Number,
  category: String (enum: ['clothing', 'electronics', 'beauty', 'fashion', 'shoes', 'books', 'sports', 'furniture']),
  subcategory: String,
  brand: String,
  images: [{ url: String, alt: String }],
  stock: Number (required),
  sku: String (unique),
  tags: [String],
  specifications: Map,
  size: String (enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
  color: String,
  material: String,
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },
  warranty: String,
  powerConsumption: String,
  author: String,
  isbn: String,
  pages: Number,
  language: String,
  sportType: String,
  roomType: String (enum: ['living-room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining-room', 'outdoor']),
  assemblyRequired: Boolean,
  rating: Number,
  numReviews: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  metaTitle: String,
  metaDescription: String,
  slug: String (unique)
}
```

### Category Schema
```javascript
{
  name: String (required, unique),
  slug: String (unique),
  description: String,
  image: { url: String, alt: String },
  parentCategory: ObjectId (ref: 'Category'),
  subcategories: [ObjectId] (ref: 'Category'),
  isActive: Boolean,
  isFeatured: Boolean,
  sortOrder: Number,
  metaTitle: String,
  metaDescription: String,
  productCount: Number
}
```

## 🎯 Product Categories

The API supports the following product categories:

1. **Clothing** - Apparel and fashion items
2. **Electronics** - Gadgets and electronic devices
3. **Beauty** - Cosmetics and personal care
4. **Fashion** - Accessories and fashion items
5. **Shoes** - Footwear for all occasions
6. **Books** - Literature and educational materials
7. **Sports** - Athletic equipment and gear
8. **Furniture** - Home and office furniture

## 🔧 Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database
npm run seed
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive validation
- **File Upload Security**: File type and size restrictions
- **Error Handling**: Secure error responses

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

6. **Test the API:**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5000/api/products
   ```

## 📊 Sample Data

The seeding script creates sample data for all categories:

- **Clothing**: T-shirts, jeans
- **Electronics**: Smartphones, headphones
- **Beauty**: Face creams
- **Fashion**: Handbags
- **Shoes**: Running shoes
- **Books**: Programming books
- **Sports**: Yoga mats
- **Furniture**: Coffee tables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 