const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.json(users.map((u) => u.toJSON()));
});

usersRouter.post('/', async (request, response, next) => {
  if (!request.body.password || (request.body.password.length < 8)) {
    response.status(400).json({ error: 'password has to be at least 8 characters' });
  } else {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

      const user = new User({
        email: request.body.email,
        country: request.body.country,
        passwordHash,
      });

      const savedUser = await user.save();
      response.status(201).json(savedUser);
    } catch (exception) {
      next(exception);
    }
  }
});

module.exports = usersRouter;
