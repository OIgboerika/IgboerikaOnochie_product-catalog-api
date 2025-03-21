# Product Catalog API Documentation

## Base URL

## Authentication

Currently, the API is open and does not require authentication.

## Response Format

All endpoints return data in JSON format.

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Products API

### Get All Products

```
GET /products
```

Query Parameters:

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (e.g., "name", "-price" for descending)
- `category` (optional): Filter by category ID

Response:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

### Get Product by ID

```
GET /products/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": {
      "id": "category_id",
      "name": "Category Name"
    },
    "variants": [...],
    "inventory": {...}
  }
}
```

### Create Product

```
POST /products
```

Request Body:

```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "categoryId": "category_id",
  "variants": [
    {
      "name": "Size S",
      "sku": "PRD-S",
      "price": 99.99
    }
  ]
}
```

### Update Product

```
PUT /products/:id
```

Request Body:

```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "categoryId": "category_id",
  "variants": [
    {
      "name": "Size S",
      "sku": "PRD-S",
      "price": 99.99
    }
  ]
}
```

### Delete Product

```
DELETE /products/:id
```

## Categories API

### Get All Categories

```
GET /categories
```

### Get Category by ID

```
GET /categories/:id
```

### Create Category

```
POST /categories
```

Request Body:

```json
{
  "name": "Category Name",
  "description": "Category Description",
  "parentId": "parent_category_id" // optional
}
```

### Update Category

```
PUT /categories/:id
```

### Delete Category

```
DELETE /categories/:id
```

### Get Products in Category

```
GET /categories/:id/products
```

## Search API

### Search Products

```
GET /search/products
```

Query Parameters:

- `q`: Search query
- `filters`: JSON object of filters
- `page`: Page number
- `limit`: Items per page

Example:

```
GET /search/products?q=shirt&filters={"category":"mens","minPrice":20,"maxPrice":100}
```

### Search Categories

```
GET /search/categories
```

Query Parameters:

- `q`: Search query

### Get Search Suggestions

```
GET /search/suggestions
```

Query Parameters:

- `q`: Partial search query

## Inventory API

### Update Inventory

```
POST /inventory/update
```

Request Body:

```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "quantity": 100
}
```

### Get Product Inventory

```
GET /inventory/product/:productId
```

### Get Variant Inventory

```
GET /inventory/variant/:variantId
```

### Adjust Inventory

```
POST /inventory/adjust
```

Request Body:

```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "adjustment": 10, // Can be negative for reduction
  "reason": "RESTOCK" // RESTOCK, SALE, DAMAGE, etc.
}
```

### Get Low Stock Items

```
GET /inventory/low-stock
```

Query Parameters:

- `threshold` (optional): Stock level threshold (default: 10)

## Reports API

### Low Stock Report

```
GET /reports/low-stock
```

Query Parameters:

- `format` (optional): Response format (json/csv, default: json)
- `threshold` (optional): Stock level threshold

### Inventory Value Report

```
GET /reports/inventory-value
```

Query Parameters:

- `format` (optional): Response format (json/csv, default: json)
- `categoryId` (optional): Filter by category

### Category Summary Report

```
GET /reports/category-summary
```

Query Parameters:

- `format` (optional): Response format (json/csv, default: json)
- `period` (optional): Time period (day/week/month/year)

### Product Variants Report

```
GET /reports/product-variants
```

Query Parameters:

- `format` (optional): Response format (json/csv, default: json)
- `productId` (optional): Filter by product

## Rate Limits

- Standard endpoints: 100 requests per IP per 15 minutes
- Search endpoints: 20 requests per IP per 15 minutes
- Report endpoints: 50 requests per IP per 15 minutes

## Error Codes

- `INVALID_INPUT`: Invalid input parameters
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Resource already exists
- `INSUFFICIENT_STOCK`: Inventory operation failed due to insufficient stock
- `VALIDATION_ERROR`: Data validation failed
- `DATABASE_ERROR`: Database operation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Internal server error

## Data Models

### Product

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "categoryId": "string",
  "variants": ["Variant"],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Category

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "parentId": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Variant

```json
{
  "id": "string",
  "productId": "string",
  "name": "string",
  "sku": "string",
  "price": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Inventory

```json
{
  "id": "string",
  "productId": "string",
  "variantId": "string",
  "quantity": "number",
  "lastUpdated": "date"
}
```

This API documentation provides:

1. Complete endpoint descriptions
2. Request/response formats
3. Query parameters
4. Data models
5. Error codes
6. Rate limiting details
