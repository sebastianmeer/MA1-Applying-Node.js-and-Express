const nodemailer = require('nodemailer');

const createTransport = () => {
    const host = process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io';
    const port = process.env.EMAIL_PORT || process.env.MAILTRAP_PORT;
    const username =
        process.env.EMAIL_USERNAME ||
        process.env.MAILTRAP_USERNAME ||
        process.env.Username;
    const password =
        process.env.EMAIL_PASSWORD ||
        process.env.MAILTRAP_PASSWORD ||
        process.env.Password;

    if (!host || !port || !username || !password) {
        throw new Error('Mailtrap SMTP environment variables are not fully configured');
    }

    return nodemailer.createTransport({
        host,
        port: Number(port),
        auth: {
            user: username,
            pass: password,
        },
    });
};

module.exports = async function sendEmail(options) {
    const transporter = createTransport();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Local Marketplace <no-reply@local-marketplace.test>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};
