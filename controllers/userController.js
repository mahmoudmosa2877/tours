//const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../model/usersmodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factorFun = require('./factorFun');

// const multerStorage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function(req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
//const storage = multer.memoryStorage();

const multerFilter = function(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(' that is no an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// we want to add select .select('+active')
exports.getAllUsers = factorFun.getAll(User);

// catchAsync(async (req, res) => {
//   user = await User.find().select('+active');

//   res.status(200).json({
//     status: 'success',
//     results: user.length,
//     data: {
//       user
//     }
//   });
// });
exports.getUser = factorFun.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)create error if user try to change password
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'this route is not for password, please try updatepassword route',
        500
      )
    );
  }

  //2) filtered user with unwanted data
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  //2)update user document
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user
  });
  //3)
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = factorFun.updateOne(User);
exports.deleteUser = factorFun.deleteOne(User);
