const User = require('../../models/user');

const initialUsers = [
  {
    email: 'jorg@example.com',
    country: 'Denmark',
    password: 'sekret123',
  },
  {
    email: 'esko@example.com',
    country: 'Finland',
    password: 'sekret456',
  },
];

const initialProducts = [
  {
    title: 'shoes',
    price: 10.5,
  },
  {
    title: 'mittens',
    price: 1.5,
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  usersInDb,
  initialUsers,
  initialProducts,

};
