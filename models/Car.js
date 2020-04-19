const mongoose = require('mongoose');


const CarSchema = new mongoose.Schema({

    carnumber: { type: String, required: true },
    ncinowner: { type: String, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    mileage: { type: String, required: true },
    state: { type: Boolean },
    images: { type: String, required: true },

})

module.exports = mongoose.model('Car', CarSchema);