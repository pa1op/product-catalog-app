require('dotenv').config();

const { OPENEXCHANGERATES_API_KEY } = process.env;
const { PORT } = process.env;
let { MONGODB_URI } = process.env;

if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
  OPENEXCHANGERATES_API_KEY,
};
