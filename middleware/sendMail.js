const nodemailer = require('nodemailer');
const nodemailMailGun = require('nodemailer-mailgun-transport')


module.exports = async (mail, subject, content) => {
    const auth = {
        auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
        }
    }
    let transporter = nodemailer.createTransport(nodemailMailGun(auth));
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: subject,
            html: `<b>${content}</b>`
        });
        res.status(200).json({ message: "done" })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }

}
