# Product catalog app

Product catalog implemented with node.js, express.js, and mongodb

## Get started

Application expects certain environment variables to be defined. During development dotenv was used for this purpose. Define your own environment variables with a .env file at project root level

Example:
```
PORT=3001
MONGODB_URI='mongodb+srv://<username>:<password>@cluster0-6n9o6.mongodb.net/product_catalog?retryWrites=true&w=majority'
TEST_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0-6n9o6.mongodb.net/test_product_catalog?retryWrites=true&w=majority'
SECRET='qwertyuiop123456789'
OPENEXCHANGERATES_API_KEY='abc123'
```
**PORT** - Which port application runs at

**MONGODB_URI** - Connetion string for mongodb database for development

**TEST_MONGODB_URI** - Connection string for mongodb database for integration testing

**SECRET** - Secret for generating tokens during login

**OPENEXCHANGERATES_API_KEY** - API key for currency conversion rates ([https://openexchangerates.org/](https://openexchangerates.org/))

---
Once you have set up environment file you can proceed

Install dependencies:
```
$ npm install
```
Makes sure everything works by running tests:
````
$ npm run test
````
Run application:
```
$ npm run watch
```


## API documentation

### User API
**Get existing users:**
````
REQUEST:
GET localhost:3001/api/users

RESPONSE:
[
    {
        "products": [
            "5de56d0f36c6ede6095b50a2",
            "5de56d1636c6ede6095b50a3"
        ],
        "email": "antti@example.com",
        "country": "Finland",
        "id": "5de56cb8bdaf7fe5fe4258d1"
    },
    {
        "products": [],
        "email": "jens@example.com",
        "country": "Denmark",
        "id": "5de56cc1bdaf7fe5fe4258d2"
    }
]
````
**Create new user:**
````
REQUEST:
POST localhost:3001/api/users
Content-Type: "application/json"
{
	"email": "antti@example.com",
	"password": "Pass1234",
	"country": "Finland"
}

RESPONSE:
{
    "products": [],
    "email": "jens@example.com",
    "country": "Denmark",
    "id": "5de56cc1bdaf7fe5fe4258d2"
}
````
### Login API
Login with created user:
````
REQUEST:
POST localhost:3001/api/login
Content-Type: "application/json"
{
	"email": "antti@example.com",
	"password": "Pass1234"
}
RESPONSE:
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE",
    "email": "antti@example.com"
}
````
### Product API
**Get all products.** If Authorization header is passed, prices are converted to the currency of users country:
````
REQUEST:
GET localhost:3001/api/products
Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE"

RESPONSE:
[
    {
        "likes": 0,
        "title": "jeans",
        "price": 597.73,
        "user": {
            "email": "antti@example.com",
            "country": "Finland",
            "id": "5de56cb8bdaf7fe5fe4258d1"
        },
        "id": "5de56d0f36c6ede6095b50a2"
    },
    {
        "likes": 0,
        "title": "jacket",
        "price": 1120.73,
        "user": {
            "email": "antti@example.com",
            "country": "Finland",
            "id": "5de56cb8bdaf7fe5fe4258d1"
        },
        "id": "5de56d1636c6ede6095b50a3"
    }
]
````
It is also possible to sort and query for products.
Sort:
```
REQUEST:
GET localhost:3001/api/products?sort=price

RESPONSE:
[
    {
        "likes": 0,
        "title": "jacket",
        "price": 150,
        "user": {
            "email": "antti@example.com",
            "country": "Finland",
            "id": "5de56cb8bdaf7fe5fe4258d1"
        },
        "id": "5de56d1636c6ede6095b50a3"
    },
    {
        "likes": 0,
        "title": "jeans",
        "price": 80,
        "user": {
            "email": "antti@example.com",
            "country": "Finland",
            "id": "5de56cb8bdaf7fe5fe4258d1"
        },
        "id": "5de56d0f36c6ede6095b50a2"
    }
]
```
Query:
```
REQUEST:
GET localhost:3001/api/products
{
	"price":
		{
			"gte": 100,
			"lte": 200
		}
}

RESPONSE:
[
    {
        "likes": 0,
        "title": "jacket",
        "price": 150,
        "user": {
            "email": "antti@example.com",
            "country": "Finland",
            "id": "5de56cb8bdaf7fe5fe4258d1"
        },
        "id": "5de56d1636c6ede6095b50a3"
    }
]
```

**Create new product:**
```
REQUEST:
POST localhost:3001/api/products
Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE"
Content-Type: "application/json"
{
	"title": "jacket",
	"price": 150
}

RESPONSE:
{
    "likes": 0,
    "title": "jacket",
    "price": 150,
    "user": "5de56cb8bdaf7fe5fe4258d1",
    "id": "5de56d1636c6ede6095b50a3"
}
```
**Update product:**
````
REQUEST:
PUT localhost:3001/api/products/5de56d1636c6ede6095b50a3
Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE"
Content-Type: "application/json"
{
	"title": "jacket",
	"price": 155
}

RESPONSE:
{
    "likes": 0,
    "title": "jacket",
    "price": 155,
    "user": "5de56cb8bdaf7fe5fe4258d1",
    "id": "5de56d1636c6ede6095b50a3"
}
````

**Delete Product:**

**Update product:**
````
REQUEST:
DELETE localhost:3001/api/products/5de56d1636c6ede6095b50a3
Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE"
````

**Like a Product:**
````
REQUEST:
PATCH localhost:3001/api/products/5de56d1636c6ede6095b50a3
Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb21iLCJpZCI6IjYkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AGM96Pc7q0xip-Zf-zcnE"

RESPONSE:
{
    "likes": 1,
    "title": "jacket",
    "price": 155,
    "user": "5de56cb8bdaf7fe5fe4258d1",
    "id": "5de56d1636c6ede6095b50a3"
}
````

