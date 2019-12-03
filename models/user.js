require('mongoose-type-email');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true,
    required: true,
  },
  country: {
    type: String,
    enum: ['Finland', 'Denmark'],
    required: true,
  },
  passwordHash: String,
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  ],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);
userSchema.plugin(uniqueValidator);

module.exports = User;
