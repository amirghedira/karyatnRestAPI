const mongoose = require('mongoose');


const RentSchema = new mongoose.Schema({
    ncinoccupant: { type: String, required: true },
    ncinowner: { type: String, required: true },
    carnumber: { type: String, required: true },
    totalprice: { type: String, required: true },
    duration: { type: Number, required: true },
    daterent: { type: Date, required: true }
})


module.exports = mongoose.model('Rent', RentSchema)