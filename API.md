# API Documentation - E-Commerce Platform

## Overview

| Property | Value |
|----------|-------|
| Base URL (Dev) | `http://localhost:3000/api/v1` |
| Base URL (Prod) | `https://your-api.com/api/v1` |
| API Version | v1 |
| Format | JSON |
| Authentication | JWT Bearer Token |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```
## Auth Endpoints

### Register User
```http
POST /auth/signup
```
### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Products Endpoints
### Get All Products
```http
GET /products?categories=1,2&sort=price_asc
```
### Query Parameters

| Parameter | Values |
|-----------|--------|
| categories | Comma-separated category IDs |
| sort | price_asc, price_desc, rating, name_asc, name_desc |

### response
```bash
[
  {
    "product_id": 1,
    "name": "Product Name",
    "price": 29.99,
    "category_id": 1,
    "avg_rating": 4.5,
    "image_url": "/path/to/image.jpg"
  }
]
```

### Get Single Product
```bash
GET /products/:id
```
### Response
```bash
{
  "product_id": 1,
  "name": "Product Name",
  "description": "Detailed description",
  "price": 29.99,
  "category_id": 1,
  "stock_quantity": 100,
  "avg_rating": 4.5
}
```
### Search Products
```bash
GET /products/search?q=laptop&minPrice=100&maxPrice=1000
```
### Response
Array of matching products

### Get Featured Products
```bash
GET /products/featured?ids=1,2,3
```
### Get Products by IDs
```bash
GET /products/by-ids?ids=1,2,3
```
### Get Search Suggestions
```bash
GET /products/suggestions?q=lap
```
### Response
```bash
["laptop", "laptop bag", "laptop stand"]
```
## Categories Endpoints
### Get All Categories
```http
GET /categories
```
### Response:
```bash
[
  { "category_id": 1, "name": "Electronics" },
  { "category_id": 2, "name": "Clothing" }
]
```
## 🛒 Cart Endpoints
### Get Cart
```http
GET /cart/:userId
Authorization: Bearer <token>
```
### Response:
```bash
[
  {
    "cart_item_id": 1,
    "product_id": 1,
    "quantity": 2,
    "products": {
      "name": "Product",
      "price": 29.99
    }
  }
]
```
### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
```
### Request:
```bash
{
  "userId": "uuid",
  "productId": 1,
  "quantity": 1
}
```
### Update Quantity
```http
PUT /cart/:cartItemId
```
### Request:
```bash
{ "quantity": 3 }
```
### Remove from Cart
```http
DELETE /cart/:cartItemId
```
## 💖 Wishlist Endpoints
### Get Wishlist
```http
GET /wishlist/:userId
Authorization: Bearer <token>
```
### Response:
```bash
[
  { "product_id": 1, "name": "Product" }
]
```
### Toggle Wishlist
```http
POST /wishlist/toggle
```
### Request:
```bash
{
  "userId": "uuid",
  "productId": 1
}
```
### Get Wishlist with Details
```http
GET /wishlist/:userId/details
```
### Response: Full product details for wishlist items

## Orders Endpoints
### Get User Orders
```http
GET /orders/my-orders?userId=uuid
Authorization: Bearer <token>
```
### Response:
```bash
[
  {
    "order_id": 1,
    "total_amount": 59.98,
    "status": "completed",
    "created_at": "2024-01-15T10:00:00Z",
    "items": [...]
  }
]
```
### Place Order
```http
POST /orders/place
```
### Request:
```bash
{
  "userId": "uuid",
  "items": [...],
  "shippingAddress": {...},
  "paymentIntentId": "pi_xxx"
}
```
### Response:
```bash
{
  "order_id": 1,
  "status": "pending",
  "message": "Order placed successfully"
}
```
### Payments Endpoints
### Create Payment Intent
```http
POST /payments/create-payment-intent
```
### Request:
```bash
{ "amount": 5999 }
Response:
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```
### Get Payment Intent
```http
GET /payments/payment-intent/:paymentIntentId
```
## Reviews Endpoints
### Create Review
```http
POST /reviews
```
### Request:
```bash
{
  "product_id": "1",
  "formData": {
    "name": "John",
    "rating": 5,
    "title": "Great product!",
    "review": "Really loved it"
  }
}
```
### Get Product Reviews
```http
GET /reviews/:productId
```
## Questions Endpoints
### Ask Question
```http
POST /questions
```
### Request:
```bash
{
  "product_id": "1",
  "formData": {
    "name": "John",
    "email": "john@example.com",
    "question": "Is this product available in blue?"
  }
}
```
### Get Product Questions
```http
GET /questions/:productId
```
### Response:
```bash
[
  {
    "id": 1,
    "name": "John",
    "question": "Is this available in blue?",
    "answer": "Yes, it comes in blue, black, and white."
  }
]
```
## Account/Addresses Endpoints
### Get User Addresses
```http
GET /account/addresses/:userId
Authorization: Bearer <token>
```
### Response:
```bash
[
  {
    "id": 1,
    "type": "shipping",
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
]
```
### Save Address
```http
POST /account/addresses/:userId
```
### Request:
```bash
{
  "type": "shipping",
  "formData": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```
### Delete Address
```http
DELETE /account/addresses/:userId/:addressId
```
## AI Chatbot
### Send Message
```http
POST https://chatbot-gateway.railway.app/api/chat
```
### Request:
```bash
{
  "message": "Help me find a laptop",
  "userId": "uuid",
  "botId": "ecommerce"
}
```
### Response:
```bash
{
  "response": "Sure! What budget are you looking for?",
  "suggestions": ["Under $500", "$500-$1000", "Over $1000"]
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

### Testing Examples
### cURL Examples
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```
### Get products
```bash
curl http://localhost:3000/api/v1/products
```
### Add to cart
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid","productId":1,"quantity":1}'
```