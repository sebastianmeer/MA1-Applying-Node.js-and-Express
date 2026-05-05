const normalizeQueryValue = (value) =>
    Array.isArray(value) ? value[value.length - 1] : value;

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        Object.keys(queryObj).forEach((key) => {
            queryObj[key] = normalizeQueryValue(queryObj[key]);
        });

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        const sort = normalizeQueryValue(this.queryString.sort);

        if (sort) {
            const sortBy = sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-postedDate');
        }

        return this;
    }

    limitFields() {
        const selectedFields = normalizeQueryValue(this.queryString.fields);

        if (selectedFields) {
            const fields = selectedFields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = normalizeQueryValue(this.queryString.page) * 1 || 1;
        const limit = normalizeQueryValue(this.queryString.limit) * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
