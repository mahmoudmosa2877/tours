const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourScema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is req'],
      unique: true,
      trim: true,
      maxlength: [40, 'max length is 40'],
      minlength: [10, 'min length is 10']
      // validate: [validator.isAlpha, 'name is alpha ']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'duration is requires']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'maxgroup is requires']
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is requires'],
      enim: {
        values: ['easy', 'medium', 'difficult'],
        message: 'unknown result'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, ' the min is 0'],
      max: [5, ' the max is 4'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'price is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'discount ({VALUE}) is greater than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'discription is requires']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'imagecover is requires']
    },
    images: [String], //images
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourScema.index({ price: 1, ratingsAverage: -1 });
tourScema.index({ slug: 1 });
tourScema.index({ startLocation: '2dsphere' });

tourScema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourScema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tourRef',
  localField: '_id'
});

tourScema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourScema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourScema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

tourScema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourScema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

// tourScema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

// tourScema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

const Tour = mongoose.model('Tour', tourScema);

module.exports = Tour;
