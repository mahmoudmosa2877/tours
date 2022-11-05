const Tour = require('../model/toursmodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../model/bookingsmodel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});
// res
//   .status(200)
//   .set(
//     'Content-Security-Policy',
//     "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
//   );
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne(req.params).populate('reviews');

  if (!tour) return next(new AppError('there is no tour with that name', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.getLoggedIn = async (req, res, next) => {
  res.status(200).render('login');
};

exports.getAccount = (req, res) => {
  res.status(200).render('account');
};
exports.getMyTours = catchAsync(async (req, res) => {
  //1) find all tours that i booked
  const myTours = await Booking.find({ user: req.user.id });
  console.log(myTours);
  const tourIds = myTours.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'MyTOURS',
    tours
  });
});
