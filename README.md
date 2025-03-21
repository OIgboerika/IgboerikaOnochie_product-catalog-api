# Product Catalog API

A robust RESTful API for managing an e-commerce product catalog system built with Node.js and Express.js.

## Features

- Complete product lifecycle management (CRUD operations)
- Category organization and management
- Advanced search and filtering capabilities
- Product variant support (sizes, colors, etc.)
- Real-time inventory tracking
- Comprehensive reporting system
- Rate limiting for API protection
- Input validation and sanitization
- Error handling with detailed responses
- Logging system for debugging and monitoring

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/products` - Get products in category

### Search

- `GET /api/search/products` - Search products
- `GET /api/search/categories` - Search categories
- `GET /api/search/suggestions` - Get search suggestions

### Inventory

- `POST /api/inventory/update` - Update inventory levels
- `GET /api/inventory/product/:productId` - Get product inventory
- `GET /api/inventory/variant/:variantId` - Get variant inventory
- `POST /api/inventory/adjust` - Adjust inventory
- `GET /api/inventory/low-stock` - Get low stock items

### Reports

- `GET /api/reports/low-stock` - Get low stock report
- `GET /api/reports/inventory-value` - Get inventory value report
- `GET /api/reports/category-summary` - Get category summary
- `GET /api/reports/product-variants` - Get product variants report

## Setup and Installation

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

````

4. Start the server:
```bash
npm start
````

## Technical Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens for authentication
- Express Rate Limit for API protection
- Winston for logging

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Rate Limiting

API requests are limited to protect the server from abuse:

- 100 requests per IP per 15 minutes for most endpoints
- 20 requests per IP per 15 minutes for search endpoints

## Validation

Input validation is implemented using custom validators and middleware:

- Required fields checking
- Data type validation
- Format validation
- Business rule validation

## Logging

The application uses a structured logging system:

- Request logging
- Error logging
- Performance monitoring
- Audit trails for critical operations

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
