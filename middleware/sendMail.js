const nodemailer = require('nodemailer');
const nodemailMailGun = require('nodemailer-mailgun-transport')
const hjs = require('hogan.js')
const fs = require('fs');


exports.WelcomeEmail = async (mail, subject, content) => {
    const template = fs.readFileSync('./views/email.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
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
            html: compiledTemplate.render({ username: "amir", activateLink: "http://localhost:4020" })
        });
    } catch (error) {
        console.log(error)
    }

}
