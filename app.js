const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./utils/config');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const productsRouter = require('./controllers/products');
const middleware = require('./utils/middleware');

const app = express();

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(middleware.tokenExtractor);
app.use(bodyParser.json());
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/products', productsRouter);
app.use(middleware.errorHandler);

module.exports = app;
