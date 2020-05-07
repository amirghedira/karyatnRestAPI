const nodemailer = require('nodemailer');
const nodemailMailGun = require('nodemailer-mailgun-transport')
const hjs = require('hogan.js')
const fs = require('fs');
const auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    }
}
let transporter = nodemailer.createTransport(nodemailMailGun(auth));

exports.WelcomeEmail = async (mail, username, link) => {
    const template = fs.readFileSync('./views/email/welcome.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: 'Bienvenu a karyatn',
            html: compiledTemplate.render({ username: username, activateLink: link })
        });
    } catch (error) {
        console.log(error)
    }

}
