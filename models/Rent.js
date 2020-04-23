const mongoose = require('mongoose');


const RentSchema = new mongoose.Schema({
    carid: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    clientid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalprice: { type: String, required: true },
    duration: { type: Number, required: true },
    daterent: { type: Date, required: true }
})


module.exports = mongoose.model('Rent', RentSchema)