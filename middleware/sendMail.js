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
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// module.exports = async (mail, subject, content) => {
//     const msg = {
//         from: process.env.USER_MAIL,
//         to: mail,
//         subject: subject,
//         html: `<b>${content}</b>`
//     };
//     sgMail
//         .send(msg)
//         .then(() => { }, error => {
//             console.error(error);

//             if (error.response) {
//                 console.error(error.response.body)
//             }
//         });
// }