const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    ncin: { type: String },
    username: { type: String, required: true, Unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    access: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    licencenum: { type: String },
    birthday: { type: String, required: true },
    address: { type: String, required: true },
    profileimg: { type: String, required: true },
    backgroundimg: { type: String },
    ncinimg: { type: String },
    agencename: { type: String },
    joindate: { type: Date, required: true },
    phonenum: { type: String, required: true },
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    Clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

module.exports = mongoose.model('User', UserSchema)