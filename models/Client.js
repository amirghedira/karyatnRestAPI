const mongoose = require('mongoose')


const ClientSchema = new mongoose.Schema({
    ncin: { type: String, required: true, Unique: true },
    username: { type: String, required: true, Unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    access: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    age: { type: Number, required: true },
    licencenum: { type: String, required: true },
    birthday: { type: Date, required: true },
    address: { type: String, required: true },
    profileimg: { type: String, required: true },
    backgroundimg: { type: String },
    ncinimg: { type: String, required: true },
    joindate: { type: Date, required: true },
    phonenum: { type: String, required: true }

})

module.exports = mongoose.model('Clien', ClientSchema)