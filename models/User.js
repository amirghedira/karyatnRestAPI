const mongoose = require('mongoose')
const mongoosePagination = require('mongoose-paginate')

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
    profileimg: { type: String },
    ncinimg: { type: String },
    agencename: { type: String },
    joindate: { type: Date, required: true },
    phonenum: { type: String, required: true },
    confirmed: { type: Boolean, required: true, default: false },
    notifications: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true },
            userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            carid: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
            type: { type: String },
            read: { type: Boolean, default: false },
            date: { type: Date, default: new Date().toISOString() },
        }
    ],
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})
UserSchema.plugin(mongoosePagination)
module.exports = mongoose.model('User', UserSchema)