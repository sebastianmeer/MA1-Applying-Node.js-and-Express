const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A user must have a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'A user must have an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'A user must have a password'],
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook: hash password only when modified
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: compare candidate password against stored hash
userSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
