# Local Marketplace Postman And MongoDB Testing

Base URL used locally:

```text
http://localhost:3001
```

The product routes are JWT-protected because the app already includes the later authentication/security requirements. In Postman, first create or log in as an admin, then use the returned token as `Authorization: Bearer <token>`.

## 1. Admin Token

`POST /api/auth/signup`

```json
{
  "name": "Postman Admin",
  "email": "postman-admin@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "role": "admin"
}
```

## 2. Create Two Products

`POST /api/products`

```json
{
  "name": "Postman Test Lamp",
  "price": 850,
  "category": "Home & Garden",
  "seller": "Postman Tester",
  "description": "Desk lamp test",
  "postedDate": "2026-05-01",
  "rating": 4.4
}
```

`POST /api/products`

```json
{
  "name": "Postman Test Backpack",
  "price": 720,
  "category": "Fashion",
  "seller": "Postman Tester",
  "description": "Backpack test",
  "postedDate": "2026-05-01",
  "rating": 4.6
}
```

Database screenshot target:

```text
marketplace.products
```

## 3. View Products

`GET /api/products`

API query examples:

```text
GET /api/products?category=Fashion
GET /api/products?sort=price
GET /api/products?fields=name,price,category,seller
GET /api/products?page=1&limit=5
GET /api/products/top-3-cheap
```

## 4. Update One Product

`PATCH /api/products/:id`

```json
{
  "price": 790,
  "description": "Updated lamp test"
}
```

## 5. Delete One Product

`DELETE /api/products/:id`

Expected response status: `204 No Content`.

## Verified Locally

The live smoke test created two products, viewed with query options, updated one product, deleted one product, and confirmed the top-3 cheapest alias.

```text
CreatedProducts : Postman Test Lamp 1777670384; Postman Test Backpack 1777670384
ViewResults     : 5
TopCheapResults : 3
UpdatedPrice    : 790
DeleteStatus    : 204
```
