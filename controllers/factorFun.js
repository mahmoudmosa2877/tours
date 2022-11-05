const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // enable nested routes we get all routes for certain tour
    let filter = {};
    if (req.params.tourId) filter = { tourRef: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .paginate()
      .limitFields();

    // doc = await features.query.explain();
    doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc
      }
    });
  });

exports.getOne = (Model, populateOpt) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOpt) query = query.populate(populateOpt);

    const doc = await query;
    if (!doc) {
      return next(new AppError('no doc found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    /// i add that
    if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
    if (!req.body.userRef) req.body.userRef = req.user.id;
    // to that
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: doc
      }
    });
  });
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('no doc found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('no doc found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });
