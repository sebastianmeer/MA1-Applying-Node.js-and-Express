const mongoose = require('mongoose');
const slugify = require('slugify');

const setProductSlug = (product) => {
    if (product.name) {
        product.productSlug = buildProductSlug(product.name);
    }
};

const buildProductSlug = (name) =>
    slugify(name, { lower: false }).toUpperCase();

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            unique: true,
            trim: true,
            minlength: [3, 'A product name must have at least 3 characters'],
            maxlength: [80, 'A product name must have 80 characters or less'],
        },
        price: {
            type: Number,
            required: [true, 'A product must have a price'],
            min: [1, 'A product price must be at least 1'],
        },
        category: {
            type: String,
            required: [true, 'A product must have a category'],
            trim: true,
            enum: {
                values: ['Electronics', 'Clothes', 'Books', 'Food', 'Home', 'Services', 'Sports', 'Others'],
                message: 'Category must be Electronics, Clothes, Books, Food, Home, Services, Sports, or Others',
            },
        },
        seller: {
            type: String,
            required: [true, 'A product must have a seller'],
            trim: true,
            minlength: [2, 'A seller name must have at least 2 characters'],
            maxlength: [80, 'A seller name must have 80 characters or less'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [50, 'A product description must have 50 characters or less'],
        },
        postedDate: {
            type: Date,
            default: Date.now,
        },
        productSlug: String,
        premiumProducts: {
            type: Boolean,
            default: false,
            select: false,
        },
        priceDiscount: {
            type: Number,
            min: [0, 'Discount price cannot be negative'],
            validate: {
                validator: function (val) {
                    if (val === undefined || val === null) return true;

                    const update = this instanceof mongoose.Query ? this.getUpdate() : null;
                    const price = update
                        ? update.price || (update.$set && update.$set.price)
                        : this.price;

                    if (price === undefined || price === null) return true;
                    return val < price;
                },
                message: 'Discount price ({VALUE}) should be below the regular price',
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.index({ price: 1, name: 1 });

productSchema.virtual('daysPosted').get(function () {
    if (!this.postedDate) return null;
    const diffMs = Date.now() - this.postedDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

productSchema.pre('save', function () {
    setProductSlug(this);
});

productSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    const name = update.name || (update.$set && update.$set.name);

    if (!name) return;

    if (update.$set) {
        update.$set.productSlug = buildProductSlug(name);
    } else {
        update.productSlug = buildProductSlug(name);
    }

    this.setUpdate(update);
});

productSchema.pre('insertMany', function (next, docs) {
    const documents = Array.isArray(docs) ? docs : next;

    if (Array.isArray(documents)) {
        documents.forEach(setProductSlug);
    }

    if (typeof next === 'function') next();
});

productSchema.pre(/^find/, function () {
    this.find({ premiumProducts: { $ne: true } });
});

productSchema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;
