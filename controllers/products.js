const productsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const User = require('../models/user');
const currencyManager = require('../utils/currency_converter');

productsRouter.get('/', async (request, response, next) => {
  try {
    const limit = parseInt(request.query.limit, 10);
    const sortField = request.query.sort;
    const priceFilter = request.body.price
      ? { price: { $gte: request.body.price.gte, $lte: request.body.price.lte } }
      : {};

    const products = await Product.find(priceFilter)
      .sort({ [sortField]: -1 })
      .limit(limit)
      .populate('user', { email: 1, country: 1 });

    const productsFilteredByCountry = request.body.country
      ? products.filter((product) => product.user.country === request.body.country)
      : products;

    if (request.token) {
      const forexDataResponse = await currencyManager.getExchangeRates();
      const decodedToken = jwt.verify(request.token, process.env.SECRET);
      const user = await User.findById(decodedToken.id);
      const priceConvertedProducts = await currencyManager
        .convertPrices(productsFilteredByCountry, user.country, forexDataResponse);
      response.json(priceConvertedProducts);
    } else {
      response.json(productsFilteredByCountry);
    }
  } catch (exception) {
    next(exception);
  }
});

productsRouter.post('/', async (request, response, next) => {
  const { body } = request;
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!request.token || !decodedToken.id) {
      response.status(401).json({ error: 'token missing or invalid' });
    } else {
      const user = await User.findById(decodedToken.id);

      const product = new Product({
        title: body.title,
        price: body.price,
        likes: body.likes,
        user: user.id,
      });

      const result = await product.save();

      user.products = user.products.concat(result.id);
      await user.save();
      response.status(201).json(result);
    }
  } catch (exception) {
    next(exception);
  }
});

productsRouter.put('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!request.token || !decodedToken.id) {
      response.status(401).json({ error: 'token missing or invalid' });
    } else {
      const product = await Product.findById(request.params.id);
      const user = await User.findById(decodedToken.id);
      if ((!user) || (product.user.toJSON() !== user.toJSON().id)) {
        response.status(403).json({ error: 'not allowed to update other users products' });
      } else {
        const update = await Product.findByIdAndUpdate(
          request.params.id,
          request.body,
          { new: true },
        );
        response.json(update.toJSON());
      }
    }
  } catch (exception) {
    next(exception);
  }
});

productsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' });
  } else {
    try {
      const product = await Product.findById(request.params.id);
      const user = await User.findById(decodedToken.id);
      if ((!user) || (product.user.toJSON() !== user.toJSON().id)) {
        response.status(403).json({ error: 'not allowed to update other users products' });
      } else {
        await Product.findByIdAndRemove(request.params.id);
        response.status(204).end();
      }
    } catch (exception) {
      next(exception);
    }
  }
});

productsRouter.patch('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' });
  } else {
    try {
      const product = await Product.findById(request.params.id);
      product.likes += 1;
      product.save();
      response.json(product);
    } catch (exception) {
      next(exception);
    }
  }
});

module.exports = productsRouter;
