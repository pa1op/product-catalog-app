const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./utils/test_helper');

const api = supertest(app);

describe('login api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('created user can login', async () => {
    const [user] = helper.initialUsers;

    await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const loginResponse = await api
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send({ email: user.email, password: user.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });
});
