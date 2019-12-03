const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./utils/test_helper');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

describe('user api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const users = helper.initialUsers.map((user) => new User(user));
    const savedUsers = users.map((user) => user.save());
    await Promise.all(savedUsers);
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      email: 'antti.e.paloposki@gmail.com',
      password: 'salakala',
      country: 'Finland',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('user missing country cannot be created', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      email: 'antti.e.paloposki@gmail.com',
      password: 'salakala',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('user missing email cannot be created', async () => {
    const userMissingEmail = {
      password: 'salakala',
      country: 'Finland',
    };

    await api
      .post('/api/users')
      .send(userMissingEmail)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('user missing password cannot be created', async () => {
    const userMissingPassword = {
      email: 'antti.e.paloposki@gmail.com',
      country: 'Finland',
    };

    await api
      .post('/api/users')
      .send(userMissingPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('user with unsupported country cannot be created', async () => {
    const wrongNationalityUser = {
      email: 'antti.e.paloposki@gmail.com',
      password: 'salakala',
      country: 'Sweden',
    };

    await api
      .post('/api/users')
      .send(wrongNationalityUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
  afterAll((done) => {
    mongoose.connection.close();
    done();
  });
});
