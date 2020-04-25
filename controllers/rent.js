const Rent = require('../models/Rent');
const Car = require('../models/Car');
const User = require('../models/User')
const mongoose = require('mongoose')


exports.getRents = (req, res) => {
    Rent.find()
        .then(rents => {
            res.status(200).json({ rents: rents })

        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}
exports.sendRequest = (req, res, next) => {

    Car.findOne({ _id: req.body.carid })
        .then(car => {
            if (car) {
                if (car.state) {
                    const date = new Date().toISOString();
                    const rent = new Rent({
                        carid: car._id,
                        clientid: req.user._id,
                        ownerid: req.params.ownerid,
                        totalprice: req.body.totalprice,
                        from: req.body.fromdate,
                        to: req.body.todate,
                        daterent: date
                    })
                    rent.save()

                        .then(result => {

                            User.updateOne({ _id: req.params.ownerid }, {
                                $push: {
                                    notifications: {
                                        _id: new mongoose.Types.ObjectId(),
                                        clientid: client._id,
                                        fromdate: req.body.fromdate,
                                        carid: new mongoose.Types.ObjectId(),
                                        type: 'request'
                                    }
                                }
                            })
                                .then(result => {
                                    res.status(200).json({ message: 'Request successfully sent' })

                                })
                                .catch(err => {
                                    res.status(501).json({ message: err })
                                })
                        })
                        .catch(err => {
                            res.send(err)
                        })

                } else {

                    res.status(404).json({ message: 'Car not found' });
                }

            } else {
                res.status(409).json({ message: 'Car already rented' });
            }
        })
        .catch(err => {
            res.status(503).json({ message: err })
        })

}
exports.getUnValidatedRequests = (req, res) => {
    Rent.findOne({ $and: [{ ownerid: req.user._id }, { validated: false }] })
        .then(rents => {
            res.status(200).json({ rents: rents })

        })
}
exports.validateRequest = (req, res, next) => {
    Car.updateOne({ _id: req.body.carid }, { $set: { state: false } })
        .exec()
        .then(result => {
            Rent.updateOne({ _id: req.body.rentid }, { $set: { validated: true } })
                .then(result => {
                    res.status(200).json({ message: 'Request Accepted' })
                })
                .catch(err => {
                    res.status(500).json({ message: err })
                })

        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}
exports.declineRequest = (req, res, next) => {
    Rent.deleteOne({ _id: req.body.req })
        .then(result => {
            res.status(200).json({ message: 'Request declined' })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}
exports.getClienthistory = (req, res, next) => {

    Rent.find({ ncinoccupant: req.params.ncin })
        .exec()
        .then(histories => {
            res.status(200).json({ histories: histories })
        })
        .catch(err => {

            res.status(500).json({ message: err })

        })


}

exports.getClientCount = (req, res, next) => {

    Rent.countDocuments({ ncinowner: req.params.ncin })
        .exec()
        .then(count => {
            res.status(200).json({ count: count })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}

