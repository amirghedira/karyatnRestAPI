const mongoose = require('mongoose');


const CarSchema = new mongoose.Schema({

    carnumber: { type: String, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    mileage: { type: String, required: true },
    state: { type: Boolean },
    images: [{ type: String }],
    address: { type: String, required: true },
    ownerid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

})

module.exports = mongoose.model('Car', CarSchema);