const mongoose = require('mongoose');
const Tour = require('./toursmodel');
//console
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review is required ']
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: { type: Date, default: Date.now() },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'user is required']
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'tour is required']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tourRef: 1, userRef: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({ path: 'tourRef', select: 'name' });
  this.populate({ path: 'userRef', select: 'name photo' });
  next();
});

reviewSchema.statics.calAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tourRef: tourId } },
    {
      $group: {
        _id: '$tourRef',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // very imp this  => document ,,, this.constructor => Model
  // as we can not (Review)use before declare
  this.constructor.calAverageRating(this.tourRef);
});

// this way success but we will make it by course way
// reviewSchema.post(/^findOneAnd/, async function() {
//   const r = await this.findOne();
//   r.constructor.calAverageRating(r.tourRef);
// });

// he assumed that query is excuted so it is not found in post
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
// we have an issue here when we delete review which does not exists give us error
// of calling function on undefined so we add (?.)
reviewSchema.post(/^findOneAnd/, async function() {
  //  console.log(this);
  await this.r?.constructor.calAverageRating(this.r.tourRef);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
