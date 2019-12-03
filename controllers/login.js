const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response, next) => {
  try {
    const user = await User.findOne({ email: request.body.email });
    const goodLogin = user === null
      ? false
      : await bcrypt.compare(request.body.password, user.passwordHash);

    if (!(user && goodLogin)) {
      response.status(401).json({
        error: 'invalid email or password',
      });
    } else {
      const userForToken = {
        email: user.email,
        id: user.id,
      };

      const token = jwt.sign(userForToken, process.env.SECRET);

      response
        .status(200)
        .send({
          token,
          email: user.email,
        });
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = loginRouter;
