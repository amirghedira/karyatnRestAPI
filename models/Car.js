const mongoose = require('mongoose');


const CarSchema = new mongoose.Schema({

    carnumber: { type: String, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    transmission: { type: String, required: true },
    climatisation: { type: String, required: true },
    doorscount: { type: Number, required: true },
    seatscount: { type: Number, required: true },
    state: { type: Boolean, default: true },
    images: [{ type: String }],
    address: { type: String, required: true },
    addedDate: { type: Date },
    ownerid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

})

module.exports = mongoose.model('Car', CarSchema);