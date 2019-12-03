const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Product = require('../models/product');
const User = require('../models/user');
const helper = require('./utils/test_helper');

const api = supertest(app);

let auth;

describe('product api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    const [user] = helper.initialUsers;

    await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const loginResponse = await api
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send({ email: user.email, password: user.password })
      .expect(200);

    auth = loginResponse.body.token;

    await api
      .post('/api/products')
      .set('Authorization', `Bearer ${auth}`)
      .send(helper.initialProducts[0])
      .expect(201)
      .expect('Content-Type', /application\/json/);

    await api
      .post('/api/products')
      .set('Authorization', `Bearer ${auth}`)
      .send(helper.initialProducts[1])
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });

  test('products are returned as json', async () => {
    const response = await api
      .get('/api/products')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body.length).toBe(helper.initialProducts.length);
  });

  test('product has correct fields', async () => {
    const response = await api.get('/api/products');
    const firstProduct = response.body[0];
    expect(firstProduct.id).toBeDefined();
    expect(firstProduct.likes).toBeDefined();
    expect(firstProduct.price).toBeDefined();
    expect(firstProduct.user).toBeDefined();
    expect(firstProduct.title).toBeDefined();
  });

  test('creating product succeeds', async () => {
    const newProduct = {
      title: 'scarf',
      price: 7.7,
    };
    const postResponse = await api
      .post('/api/products')
      .set('Authorization', `Bearer ${auth}`)
      .send(newProduct)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(postResponse.body.title).toEqual(newProduct.title);
    expect(postResponse.body.author).toEqual(newProduct.author);
    expect(postResponse.body.url).toEqual(newProduct.url);
    expect(postResponse.body.likes).toEqual(0);
    const getResponse = await api
      .get('/api/products');
    expect(getResponse.body.length).toBe(helper.initialProducts.length + 1);
  });

  test('verify product with missing fields is not created', async () => {
    const missingPriceproduct = {
      title: 'jeans',
    };
    const missingTitleproduct = {
      price: 100,
    };
    await api
      .post('/api/products')
      .set('Authorization', `Bearer ${auth}`)
      .send(missingTitleproduct)
      .expect(400);
    await api
      .post('/api/products')
      .set('Authorization', `Bearer ${auth}`)
      .send(missingPriceproduct)
      .expect(400);
  });

  test('delete product works', async () => {
    const oldProducts = await api.get('/api/products');
    await api
      .delete(`/api/products/${oldProducts.body[0].id}`)
      .set('Authorization', `Bearer ${auth}`)
      .expect(204);
    const newproducts = await api.get('/api/products');
    expect(oldProducts.body.length - 1).toBe(newproducts.body.length);
  });

  test('delete product wrong auth fails', async () => {
    const oldProducts = await api.get('/api/products');
    await api
      .delete(`/api/products/${oldProducts.body[0].id}`)
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplbnNAZXhhbXBsZS5jb20iLCJpZCI6IjVkZTU2Y2MxYmRhZjdmZTVmZTQyNThkMiIsImlhdCI6MTU3NTMxNjc4OH0.K4vIwnJUkPiIyEz8zWRD85AEM96Pc7q0xip-Zf-zcnE')
      .expect(403);
  });

  test('update product works', async () => {
    const replacement = {
      title: 'hat',
      price: 100,
    };
    const getResult = await api.get('/api/products');
    const putResult = await api
      .put(`/api/products/${getResult.body[0].id}`)
      .set('Authorization', `Bearer ${auth}`)
      .send(replacement)
      .expect(200);
    expect(putResult.body.title).toBe(replacement.title);
    expect(putResult.body.author).toBe(replacement.author);
    expect(putResult.body.url).toBe(replacement.url);
  });

  test('update product works with missing auth fails', async () => {
    const replacement = {
      title: 'hat',
      price: 100,
    };
    const getResult = await api.get('/api/products');
    await api
      .put(`/api/products/${getResult.body[0].id}`)
      .send(replacement)
      .expect(401);
  });

  test('like a product works', async () => {
    const response = await api
      .get('/api/products')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const oldProduct = response.body[0];
    expect(oldProduct.likes).toBe(0);
    const updatedProduct = await api
      .patch(`/api/products/${oldProduct.id}`)
      .set('Authorization', `Bearer ${auth}`)
      .expect(200);
    expect(updatedProduct.body.likes).toBe(1);
  });

  test('limit works', async () => {
    const limitLength = 1;
    const response = await api
      .get(`/api/products?limit=${limitLength}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body.length).toBe(limitLength);
  });

  test('query works', async () => {
    const query = {
      price: {
        gte: 0,
        lte: 10,
      },
      country: 'Denmark',
    };
    const response = await api
      .get('/api/products')
      .send(query)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const correctProducts = helper.initialProducts.filter((product) => product.price <= 10.0);
    expect(response.body[0].title).toBe(correctProducts[0].title);
  });

  test('query without price filters countries', async () => {
    const query = {
      country: 'Finland',
    };
    const response = await api
      .get('/api/products')
      .send(query)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toStrictEqual([]);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
