const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'JsonWebTokenError' && error.message === 'jwt must be provided') {
    response.status(401).send({ error: 'missing authorization token' });
  }
  if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message });
  }

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }
  next();
};

module.exports = {
  errorHandler,
  tokenExtractor,
};
