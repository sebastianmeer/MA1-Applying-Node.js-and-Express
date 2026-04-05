const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'A product must have a price'],
        },
        category: {
            type: String,
            required: [true, 'A product must have a category'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [50, 'A product description must have 50 characters or less'],
        },
        rating: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        seller: {
            type: String,
            required: [true, 'A product must have a seller'],
            trim: true,
        },
        postedDate: {
            type: Date,
        },
        productSlug: {
            type: String,
        },
        premiumProducts: {
            type: Boolean,
            default: false,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below the regular price',
            },
        },
        image: {
            type: String,
            default: 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual('daysPosted').get(function () {
    if (!this.postedDate) return null;
    const diffMs = Date.now() - this.postedDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

productSchema.pre('save', function () {
    this.productSlug = slugify(this.name, { lower: false }).toUpperCase();
});

productSchema.pre(/^find/, function () {
    this.find({ premiumProducts: { $ne: true } });
});

productSchema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
