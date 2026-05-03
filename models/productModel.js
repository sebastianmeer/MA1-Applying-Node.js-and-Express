const mongoose = require('mongoose');
const slugify = require('slugify');

const setProductSlug = (product) => {
    if (product.name) {
        product.productSlug = slugify(product.name, { lower: false }).toUpperCase();
    }
};

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            unique: true,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'A product must have a price'],
            min: [0, 'A product price must be 0 or above'],
        },
        category: {
            type: String,
            required: [true, 'A product must have a category'],
            trim: true,
        },
        seller: {
            type: String,
            required: [true, 'A product must have a seller'],
            trim: true,
        },
        image: {
            type: String,
            default: 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image',
            trim: true,
        },
        quantity: {
            type: String,
            default: '1 item',
            trim: true,
        },
        organic: {
            type: Boolean,
            default: false,
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
