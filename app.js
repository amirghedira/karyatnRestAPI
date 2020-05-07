const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const carRoutes = require('./routes/car');
const rentRoutes = require('./routes/rent');
const clientRoutes = require('./routes/user');
const mongoose = require('mongoose');
const { WelcomeEmail } = require('./middleware/sendMail')

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

app.get('/preview', (req, res) => {
    WelcomeEmail("amirghedira06@gmail.com", "Bienvenu a karyatn", "this is my content test")
    res.status(200).json({ message: 'done' })
})

app.use('/car', carRoutes);
app.use('/rent', rentRoutes);
app.use('/user', clientRoutes);





module.exports = app;