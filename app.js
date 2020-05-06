const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const carRoutes = require('./routes/car');
const rentRoutes = require('./routes/rent');
const clientRoutes = require('./routes/user');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer')
const nodemailMailGun = require('nodemailer-mailgun-transport')

mongoose.connect(process.env.MONGO_INFO, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.all("/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/preview', async (req, res) => {

    const auth = {
        auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.evn.MAILGUN_DOMAIN
        }
    }
    let transporter = nodemailer.createTransport(nodemailMailGun(auth));


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

})

app.use('/car', carRoutes);
app.use('/rent', rentRoutes);
app.use('/user', clientRoutes);





module.exports = app;