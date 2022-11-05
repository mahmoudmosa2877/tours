const Review = require('./../model/reviewsmodel');
const catchAsync = require('./../utils/catchAsync');
const factorFun = require('./factorFun');
exports.getAllReviews = factorFun.getAll(Review);

exports.craeteNewReviewes = factorFun.createOne(Review);

exports.deleteReview = factorFun.deleteOne(Review);
exports.updateReview = factorFun.updateOne(Review);
exports.getReview = factorFun.getOne(Review);
