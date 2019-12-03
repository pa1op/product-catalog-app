const fx = require('money');
const axios = require('axios');
const config = require('./config');

const currencyCodes = {
  Finland: 'EUR',
  Denmark: 'DKK',
};

const getExchangeRates = async () => axios.get(`https://openexchangerates.org/api/latest.json?app_id=${config.OPENEXCHANGERATES_API_KEY}`);

const convertPrices = async (products, userCountry, forexData) => {
  fx.rates = forexData.data.rates;
  fx.base = forexData.data.base;
  return products.map((product) => {
    const updatedPriceProduct = product;
    if (product.user.country !== userCountry) {
      updatedPriceProduct.price = fx
        .convert(product.price, {
          from: currencyCodes[product.user.country],
          to: currencyCodes[userCountry],
        }).toFixed(2);
    }
    return updatedPriceProduct;
  });
};

const generateProductPriceString = async (user, products) => {
  const forexData = await getExchangeRates();
  if (user) {
    return convertPrices(products, user.country, forexData);
  }
  return products;
};

module.exports = {
  convertPrices,
  generateProductPriceString,
  getExchangeRates,
};
