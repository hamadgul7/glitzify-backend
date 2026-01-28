const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            // port: 587,
            port: 465,
            secure: true,
            // secure: false,
            // encryption: 'TLS',
            auth: {
                user: process.env.EMAIL_USER,         
                pass: process.env.EMAIL_PASS,     
            },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html, 
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}

module.exports = sendEmail;
