const nodemailer = require('nodemailer');


module.exports = async (mail, subject, content) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PW
        }
    });


    try {
        let info = await transporter.sendMail({
            from: process.env.USER_MAIL,
            to: mail,
            subject: subject,
            html: `<b>${content}</b>`
        });
    } catch (error) {
        console.log(error)
    }

}