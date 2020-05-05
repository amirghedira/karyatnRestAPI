const mongoose = require('mongoose');


const RentSchema = new mongoose.Schema({
    carid: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    clientid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalprice: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    daterent: { type: Date, required: true },
    validated: { type: Boolean, default: false },// represents whether the manager of the car accepted the request or not
    active: { type: Boolean, default: false }, // represents whether the rents is beening consummed by a client or not
    ended: { type: Boolean, default: false } // represents whether a rent is consumed or not
})


module.exports = mongoose.model('Rent', RentSchema)