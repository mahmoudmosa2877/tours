const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/usersmodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
// console
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const calTokenSending = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);
  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  calTokenSending(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please provide email and password', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  const correct = await user.correctPassword(password, user.password);

  if ((!user, !correct)) {
    return next(new AppError('invalid email or password!', 400));
  }
  calTokenSending(user, 201, res);
});

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it is found
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //console.log(token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    next(new AppError(' you are not logged in', 401));
  }

  //401 means unautherized
  // 2) verificaion of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //////////**////////// from here
  // 3) check if user is still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('THIS TOKEN HAS NOT A FRESH USER', 401));
  }
  // 4) check if user change password after token is isseued
  //console.log(freshUser);
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user is resently changed password please log in again', 401)
    );
  }

  // this may be use full later
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it is found

  if (req.cookies.jwt) {
    try {
      //401 means unautherized
      // 2) verificaion of token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //////////**////////// from here
      // 3) check if user is still exist
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      // 4) check if user change password after token is isseued
      //console.log(freshUser);
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // this may be use full later
      res.locals.user = freshUser;
    } catch (err) {
      return next();
    }
    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(!roles.includes(req.user.role));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you don not has permission to do this action', 403)
      );
      //403 means forbidden .....authorization
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('THERE IS NO EMAIL WITH THAT EMAIL ', 404));
  }
  //2)generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `this is the url ${resetURL}`;
  // console.log(message);

  try {
    // await sendEmail({ email: user.email, subject: 'your passeord', message });
    // res.status(201).json({
    //   status: 'success',
    //   text: 'Your password reset token (valid for 10 min)',
    //   message
    // });
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

//

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get  user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //console.log(user);

  //2) if the token has not expired , and there is user , set the new password
  if (!user) {
    return next(new AppError('TOKEN IS IN VALID OR EXPIRED', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) update changePasswordAt property for the user
  //4) log the user in ,send jwt
  calTokenSending(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2)check if the posteedcurrent password is correct
  const correct = await user.correctPassword(
    req.body.passwordConfirm,
    user.password
  );
  if (!correct) {
    return next(new AppError('your current password is wrong', 400));
  }
  // console.log(user);
  //3)if so update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  // user.name = req.user.name;
  await user.save();
  // there is a problem with save because name is require
  // and if we use
  //4)log user in send JWT
  calTokenSending(user, 201, res);
});
