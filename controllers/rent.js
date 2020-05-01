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
                Rent.find({ carid: car._id })
                    .then(rents => {
                        let validdate = { state: true, fromdate: null, todate: null };
                        rents.forEach(rent => {
                            if ((new Date(req.body.fromdate).getTime() <= new Date(rent.to).getTime() && new Date(req.body.fromdate).getTime() >= new Date(rent.from).getTime())) {
                                validdate.state = false;
                                validdate.fromdate = rent.from
                                validdate.todate = rent.to
                            }

                        })
                        if (validdate.state) {
                            const rent = new Rent({
                                carid: car._id,
                                clientid: req.user._id,
                                ownerid: req.params.ownerid,
                                totalprice: req.body.totalprice,
                                from: req.body.fromdate,
                                to: req.body.todate,
                                daterent: new Date().toISOString()
                            })
                            rent.save()
                                .then(result => {
                                    User.updateOne({ _id: req.params.ownerid }, {
                                        $push: {
                                            notifications: {
                                                _id: new mongoose.Types.ObjectId(),
                                                userid: req.user._id,
                                                carid: car._id,
                                                type: 'request'
                                            }
                                        }
                                    })
                                        .then(result => {
                                            res.status(200).json({ message: 'Request successfully sent' })

                                        })
                                        .catch(err => {
                                            res.status(500).json({ message: "err" })
                                        })
                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })
                                })

                        } else {
                            res.status(409).json({ message: 'Car already reserved', fromdate: validdate.fromdate, todate: validdate.todate })
                        }
                    })
                    .catch(err => {
                        res.status(500).json({ message: err })
                    })
            } else {

                res.status(404).json({ message: 'Car not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}

exports.endRent = (req, res) => {
    Rent.findone({ _id: req.params.id })
        .then(rent => {
            rent.active = false;
            rent.save()
                .then(result => {
                    Car.updateOne({ _id: rent.carid }, { $set: { state: true } })
                        .then(result => {
                            res.status(200).json({ message: 'rent successfully ended' })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })
                        })
                })
                .catch(err => {
                    res.status(500).json({ message: err })
                })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}
exports.getUnValidatedRequests = (req, res) => {
    Rent.find({ $and: [{ ownerid: req.user._id }, { validated: false }] })
        .then(rents => {
            res.status(200).json({ rents: rents })

        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}

exports.getReservations = (req, res) => {
    Rent.find({ $and: [{ ownerid: req.user._id }, { validated: true }] })
        .then(reservations => {
            res.status(200).json({ reservations: reservations })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}
exports.getActiveRents = (req, res) => {
    Rent.find({ $and: [{ ownerid: req.user._id }, { active: true }] })
        .then(activerents => {
            res.status(200).json({ activerents: activerents })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}
exports.activateRent = (req, res) => {
    Rent.findOne({ _id: req.params.id })
        .then(rent => {
            rent.active = true
            rent.save()
                .then(result => {
                    Car.updateOne({ _id: rent.carid }, { $set: { state: false } })
                        .then(result => {
                            user.updateOne({ _id: rent.ownerid }, {
                                $push: {
                                    notifications: {
                                        _id: new mongoose.Types.ObjectId(),
                                        userid: rent.clientid,
                                        carid: rent.carid,
                                        type: 'activatedrent'
                                    }
                                }
                            })
                                .then(result => {
                                    User.updateOne({ _id: rent.clientid }, {
                                        $push: {
                                            notifications: {
                                                _id: new mongoose.Types.ObjectId(),
                                                userid: rent.ownerid,
                                                carid: rent.carid,
                                                type: 'activatedrent'
                                            }
                                        }
                                    })
                                        .then(result => {
                                            res.status(200).json({ message: 'car successfully rented' })
                                        })
                                        .catch(err => {
                                            res.status(500).json({ message: err })

                                        })
                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })

                                })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })
                        })
                })
                .catch(err => {
                    res.status(500).json({ message: err })
                })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}

exports.validateRequest = (req, res, next) => {

    Rent.findOne({ _id: req.body.rentid })
        .then(rent => {
            rent.validated = true;
            rent.save()
                .then(result => {
                    User.findOne({ _id: req.user._id })
                        .then(manager => {
                            manager.clients.push(rent.clientid)
                            manager.save()
                                .then(result => {
                                    User.updateOne({ _id: rent.clientid }, {
                                        $push: {
                                            notifications:
                                            {
                                                _id: new mongoose.Types.ObjectId(),
                                                userid: manager._id,
                                                carid: rent.carid,
                                                type: 'requestaccepted'
                                            }
                                        }
                                    })
                                        .then(result => {
                                            res.status(200).json({ message: 'Request accepted successfully' })
                                        })
                                        .catch(err => {
                                            res.status(500).json({ message: err })

                                        })

                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })

                                })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })
                        })
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
    Rent.findOne({ _id: req.body.rentid })
        .then(rent => {
            User.findOne({ _id: rent.clientid })
                .then(user => {
                    user.notifications.push({
                        _id: new mongoose.Types.ObjectId(),
                        userid: rent.ownerid,
                        carid: rent.carid,
                        type: 'declinedrequest'
                    })
                    user.save()
                        .then(result => {
                            Rent.deleteOne({ _id: req.body.rentid })
                                .then(result => {
                                    res.status(200).json({ message: 'Request declined successfully' })
                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })

                                })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })

                        })
                })
                .catch(err => {
                    res.status(500).json({ message: err })
                })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}

exports.deleteRent = (req, res) => {
    Rent.deleteOne({ _id: req.params.id })
        .then(result => {
            res.status(200).json({ message: 'e' })

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

