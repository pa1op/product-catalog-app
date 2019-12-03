const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./utils/test_helper');
const app = require('../app');
const Product = require('../models/product');
const User = require('../models/user');
const converter = require('../utils/currency_converter');

const api = supertest(app);

let auth;

describe('currency converter tests', () => {
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
  });

  test('convert currencies', async () => {
    const country1 = 'Denmark';
    const country2 = 'Finland';
    const response = await api
      .get('/api/products')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const exchangeData = await converter.getExchangeRates();

    const productsDeepCopy = response.body.map((product) => ({ ...product }));

    const firstConversion = await converter.convertPrices(productsDeepCopy, country1, exchangeData);
    productsDeepCopy.forEach((product) => {
      const match = firstConversion.find((convertedProduct) => convertedProduct.id === product.id);
      if (match.user.country === country1) {
        expect(match.price).toBe(product.price);
      } else {
        expect(match.price).not.toBe(product.price);
      }
    });

    const secondConversion = await converter.convertPrices(response.body, country2, exchangeData);
    productsDeepCopy.forEach((product) => {
      const match = secondConversion.find((convertedProduct) => convertedProduct.id === product.id);
      if (match.user.country === country2) {
        expect(match.price).toBe(product.price);
      } else {
        expect(match.price).not.toBe(product.price);
      }
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
