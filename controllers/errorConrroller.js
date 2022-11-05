const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicatedFieldDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `duplicated field value: ${value}`;
  return new AppError(message, 400);
};

const validationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('invalid token please log in again', 401);
};
const handleJWTExpiredError = () => {
  return new AppError('Expired token please log in again', 401);
};

const sendErrorDev = (err, req, res) => {
  //Api
  console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      eror: err,
      message: err.message,
      stack: err.stack
    });
  }
  //rendered website
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    console.error('erooooooooor', err);
    return res.status(500).json({
      status: 'error',
      err,
      message: 'something went very wrong'
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  }
  console.error('erooooooooor', err);
  return res.status(500).json({
    status: 'error',
    err,
    message: 'something went very wrong'
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log(error, err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicatedFieldDB(error);
    if (error.name === 'validationError') error = validationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
