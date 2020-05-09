const nodemailer = require('nodemailer');
const hjs = require('hogan.js')
const fs = require('fs');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PW
    }
});

exports.WelcomeEmail = async (mail, username, token) => {
    const template = fs.readFileSync('./views/email/welcome.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: 'Bienvenu a karyatn',
            html: compiledTemplate.render({ username: username, activateLink: `${process.env.DOMAIN}/confirmation/${token}` })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.resetPasswordMail = async (mail, username, link) => {
    const template = fs.readFileSync('./views/email/resetpassword.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: 'Veuillez réinitialiser votre mot de passe',
            html: compiledTemplate.render({ username: username, activateLink: `${process.env.DOMAIN}/resetpassword/${token}` })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.newCarPosted = async (mail, username, carid, agencyname) => {
    const template = fs.readFileSync('./views/email/newcar.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `${agencyname} a ajouter une nouvelle voiture`,
            html: compiledTemplate.render({ username: username, activateLink: `${process.env.DOMAIN}/car/${carid}`, agency: agencyname })
        });
    } catch (error) {
        console.log(error)
    }

}
//todos
exports.SendRequest = async (mail, username, clientname, clientid) => {
    const template = fs.readFileSync('./views/email/request.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `${clientname} vous a envoyer une demande de location`,
            html: compiledTemplate.render({
                username: username,
                clientlink: `${process.env.DOMAIN}/profile/${clientid}`,
                clientname: clientname,
                requestslink: `${process.env.DOMAIN}/admincp/ajout-location`
            })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.rentEnded = async (mail, username, clientname, carnumber) => {
    const template = fs.readFileSync('./views/email/rentended.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `la location de la voiture ${carnumber} a terminer`,
            html: compiledTemplate.render({ username: username, locationlink: `${process.env.DOMAIN}/admincp/history`, clientname: clientname })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.requestAccepted = async (mail, username, managerid, carnumber, requestdate, agencyname) => {
    const template = fs.readFileSync('./views/email/requestaccepted.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `Votre demande de location a été accepter`,
            html: compiledTemplate.render(
                {
                    username: username,
                    managerlink: `${process.env.DOMAIN}/profile/${managerid}`,
                    agencyname: agencyname,
                    requestdate: requestdate,
                    carnumber: carnumber
                })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.declinedRequest = async (mail, username, managerid, carid, carnumber, requestdate, agencyname) => {
    const template = fs.readFileSync('./views/email/requestdeclined.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `Votre demande de location a été rejeter`,
            html: compiledTemplate.render({
                username: username,
                managerlink: `${process.env.DOMAIN}/profile/${managerid}`,
                carlink: `${process.env.DOMAIN}/car/${carid}`,
                carnumber: carnumber,
                requestdate: requestdate,
                agencyname: agencyname
            })
        });
    } catch (error) {
        console.log(error)
    }

}

exports.rentActivatedMail = async (mail, username, rentenddate, carnumber, carid) => {
    const template = fs.readFileSync('./views/email/rentactivated.hjs', 'utf-8')
    const compiledTemplate = hjs.compile(template)
    try {
        await transporter.sendMail({
            from: '"Karyatn" <karyatn@mail.com>',
            to: mail,
            subject: `La location de le voiture ${carnumber} a commencé`,
            html: compiledTemplate.render({
                username: username,
                carnumber: carnumber,
                carlink: `${process.env.DOMAIN}/car/${carid}`,
                rentenddate: rentenddate
            })
        });
    } catch (error) {
        console.log(error)
    }

}
