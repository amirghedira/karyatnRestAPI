const Rent = require('../models/Rent');
const Car = require('../models/Car');
const User = require('../models/User')
const mongoose = require('mongoose')


exports.getRents = async (req, res) => {
    try {
        const rents = await Rent.find()
        res.status(200).json({ rents: rents })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.sendRequest = async (req, res, next) => {

    try {
        const car = await Car.findOne({ _id: req.body.carid })
        if (car) {
            const rents = await Rent.find({ carid: car._id })
            let validDate = { state: true, fromdate: null, todate: null };
            rents.forEach(rent => {
                if (!rent.ended && rent.validated && new Date(req.body.fromdate).getTime() <= new Date(rent.to).getTime() && new Date(req.body.fromdate).getTime() >= new Date(rent.from).getTime()) {
                    validDate.state = false;
                    validDate.fromdate = rent.from
                    validDate.todate = rent.to
                }
            })
            if (validDate.state) {
                const rent = new Rent({
                    carid: car._id,
                    clientid: req.user._id,
                    ownerid: req.params.ownerid,
                    totalprice: req.body.totalprice,
                    from: req.body.fromdate,
                    to: req.body.todate,
                    daterent: new Date().toISOString()
                })
                await rent.save()
                await User.updateOne({ _id: req.params.ownerid }, {
                    $push: {
                        notifications: {
                            _id: new mongoose.Types.ObjectId(),
                            userid: req.user._id,
                            carid: car._id,
                            type: 'request'
                        }
                    }
                })

                res.status(201).json({ message: 'Request successfully sent' })
                return;
            }
            res.status(409).json({ message: 'Car already reserved', fromdate: validDate.fromdate, todate: validDate.todate })
            return;

        }
        res.status(404).json({ message: 'Car not found' });
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.endRent = async (req, res) => {

    try {

        let rent = await Rent.findOne({ _id: req.params.id })
        rent.active = false;
        rent.ended = true;
        await rent.save();
        await Car.updateOne({ _id: rent.carid }, { $set: { state: true } })
        res.status(200).json({ message: 'rent successfully ended' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.getUnValidatedRequests = async (req, res) => {

    try {

        const rents = await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: false }] })
        res.status(200).json({ rents: rents })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getReservations = async (req, res) => {
    try {

        const reservations = await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: true }, { ended: false }] })
        res.status(200).json({ reservations: reservations })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.getActiveRents = async (req, res) => {
    try {

        const activerents = await Rent.find({ $and: [{ ownerid: req.user._id }, { active: true }] })
        res.status(200).json({ activerents: activerents })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.activateRent = async (req, res) => {
    try {

        let rent = await Rent.findOne({ _id: req.params.id })
        rent.active = true
        await rent.save()
        await Car.updateOne({ _id: rent.carid }, { $set: { state: false } })
        await User.updateOne({ _id: rent.ownerid }, {
            $push: {
                notifications: {
                    _id: new mongoose.Types.ObjectId(),
                    userid: rent.clientid,
                    carid: rent.carid,
                    type: 'activatedrent'
                }
            }
        })
        await User.updateOne({ _id: rent.clientid }, {
            $push: {
                notifications: {
                    _id: new mongoose.Types.ObjectId(),
                    userid: rent.ownerid,
                    carid: rent.carid,
                    type: 'activatedrent'
                }
            }
        })

        res.status(200).json({ message: 'car successfully rented' })
    } catch (error) {

        res.status(500).json({ message: err.message })
    }
}

exports.validateRequest = async (req, res, next) => {

    try {
        let rent = await Rent.findOne({ _id: req.body.rentid })
        rent.validated = true;
        await rent.save()
        let manager = await User.findOne({ _id: req.user._id })
        await User.updateOne({ _id: rent.clientid }, {
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
        if (!manager.clients.includes(rent.clientid)) {
            manager.clients.push(rent.clientid)
            await manager.save()
            res.status(200).json({ message: 'Request accepted successfully' })
            return;

        }
        res.status(200).json({ message: 'Request accepted successfully' })


    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.declineRequest = async (req, res, next) => {

    try {

        const rent = await Rent.findOne({ _id: req.body.rentid })
        const user = await User.findOne({ _id: rent.clientid })
        user.notifications.push({
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'declinedrequest'
        })
        await user.save()
        await Rent.deleteOne({ _id: req.body.rentid })
        res.status(200).json({ message: 'Request declined successfully' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.deleteRent = async (req, res) => {

    try {
        await Rent.deleteOne({ _id: req.params.id })
        res.status(200).json({ message: 'rent successfully deleted' })


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.getClienthistory = async (req, res, next) => {

    try {

        const histories = await Rent.find({ ncinoccupant: req.params.ncin })
        res.status(200).json({ histories: histories })

    } catch (error) {

        res.status(500).json({ message: error.message });
    }
}

exports.getClientCount = async (req, res, next) => {
    try {

        const count = await Rent.countDocuments({ ncinowner: req.params.ncin })
        res.status(200).json({ count: count })
    } catch (error) {

        res.status(500).json({ message: error.message });
    }

}

