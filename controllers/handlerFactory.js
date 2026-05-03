const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model, options = {}) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError(options.notFoundMessage || 'No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model, options = {}) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError(options.notFoundMessage || 'No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                [options.docName || 'doc']: doc,
            },
        });
    });

exports.createOne = (Model, options = {}) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                [options.docName || 'doc']: doc,
            },
        });
    });

exports.getOne = (Model, options = {}) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);

        if (!doc) {
            return next(new AppError(options.notFoundMessage || 'No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                [options.docName || 'doc']: doc,
            },
        });
    });

exports.getAll = (Model, options = {}) =>
    catchAsync(async (req, res, next) => {
        const queryString = {
            ...req.query,
            ...(req._queryDefaults || {}),
        };

        const features = new APIFeatures(Model.find(), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                [options.collectionName || 'docs']: docs,
            },
        });
    });
