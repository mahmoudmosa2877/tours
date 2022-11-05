const AppError = require('../utils/appError');
const Tour = require('./../model/toursmodel');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('../model/bookingsmodel');

const stripe = require('stripe')(
  'sk_test_51M04MwHB5tOBqbBIX62TNZXPMOQ2tuXweldrowKYN8wioGaL2ZhHgGE5uYtB8j90pzsOxPXOwXWieBMcmJPI4jet00rEvCkcAo'
);

exports.makeSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // this way is not save and we will replace it by
    // strip webhooks
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      // {
      //   name: `${tour.name} Tour`,
      //   description: tour.summary,
      //   images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
      //   amount: tour.price * 100,
      //   currency: 'usd',
      //   quantity: 1
      // }
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        },
        quantity: 1
      }
    ]
  });
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  console.log(user, tour, price);
  if (!tour && !user && !price) return next();
  try {
    await Booking.create({ tour, user, price });
    res.redirect(`${req.protocol}://${req.get('host')}/`);
  } catch (err) {
    console.log(err);
  }
});
