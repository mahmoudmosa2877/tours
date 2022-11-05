class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = { ...this.queryString };
    const exceptedArray = ['page', 'sort', 'limit', 'fields'];
    exceptedArray.forEach(ele => {
      delete queryObj[ele];
    });

    let objStr = JSON.stringify(queryObj);
    objStr = objStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(objStr));
    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const objSort = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(objSort);
    } else {
      this.query = this.query.sort('-createsAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    let pageIden = this.queryString.page * 1 || 1;
    let limitIden = this.queryString.limit * 1 || 100;
    let skipIden = (pageIden - 1) * limitIden;

    this.query = this.query.skip(skipIden).limit(limitIden);
    // if (req.query.page) {
    //   const numToursPage = await Tour.countDocuments();
    //   if (skipIden >= numToursPage) throw new Error('this page does not exist');
    // }
    return this;
  }
}

module.exports = APIFeatures;
