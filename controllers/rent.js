const Rent = require('../models/Rent');
const Car = require('../models/Car');
const User = require('../models/User')
const mongoose = require('mongoose')
const io = require('socket.io-client')
const socket = io('http://localhost:3000')
const { SendRequest, rentEnded, requestAccepted, declinedRequest } = require('../middleware/sendMail')

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
                const resultRent = await rent.save()
                let manager = await User.findOneAndUpdate({ _id: req.params.ownerid }, {
                    $push: {
                        notifications: {
                            _id: new mongoose.Types.ObjectId(),
                            userid: req.user._id,
                            carid: car._id,
                            type: 'request'
                        }
                    }
                })
                let client = await User.findOne({ _id: resultRent._doc.clientid })
                SendRequest(manager.email, manager.username, client.username, client._id)
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
exports.endRent = (req, res) => {

    try {
        endRentHandler(req.params.id)
        res.status(200).json({ message: 'rent ended' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}
const endRentHandler = async (rentid) => {

    //tofix

    let rent = await Rent.findOne({ _id: rentid })
    rent.active = false;
    rent.ended = true;
    await rent.save();
    const client = await User.findOneAndUpdate({ _id: rent.clientid }, {
        $push: {
            notifications: {
                _id: new mongoose.Types.ObjectId(),
                userid: rent.ownerid,
                carid: rent.carid,
                type: 'rentended'
            }
        }
    })
    const manager = await User.findOneAndUpdate({ _id: rent.ownerid }, {
        $push: {
            notifications: {
                _id: new mongoose.Types.ObjectId(),
                userid: rent.cliendid,
                carid: rent.carid,
                type: 'rentended'
            }
        }
    })
    const car = await Car.findOneAndUpdate({ _id: rent.carid }, { $set: { state: true } })

    // rentEnded(client.email, client.username, manager._id, car._id, car.carnumber)
    rentEnded(manager.email, manager.username, client.username, car.carnumber)

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
const activateRentHandler = async (rentid) => {
    try {

        let rent = await Rent.findOne({ _id: rentid })
        rent.active = true
        await rent.save()
        await Car.updateOne({ _id: rent.carid }, { $set: { state: false } })
        const ownerNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.clientid,
            carid: rent.carid,
            type: 'activatedrent'
        }
        const clientNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'activatedrent'
        }
        await User.updateOne({ _id: rent.ownerid }, {
            $push: {
                notifications: ownerNotification
            }
        })
        await User.updateOne({ _id: rent.clientid }, {
            $push: {
                notifications: clientNotification
            }
        })
        socket.emit('sendnotification', { _id: rent.ownerid, notification: ownerNotification })
        socket.emit('sendnotification', { _id: rent.clientid, notification: clientNotification })


    } catch (error) {

        console.log(error)
    }
}

exports.validateRequest = async (req, res, next) => {

    //tofix
    try {
        let rent = await Rent.findOne({ _id: req.body.rentid }).populate('carid')
        rent.validated = true;
        await rent.save()
        let manager = await User.findOne({ _id: req.user._id })
        let client = await User.findOneAndUpdate({ _id: rent.clientid }, {
            $push: {
                notifications:
                {
                    _id: new mongoose.Types.ObjectId(),
                    userid: manager._id,
                    carid: rent.carid._id,
                    type: 'requestaccepted'
                }
            }
        })
        setTimeout(() => activateRentHandler(rent._id), new Date(rent.from).getTime() - new Date().getTime());
        setTimeout(() => endRentHandle(rent._id), new Date(rent.to).getTime() - new Date().getTime());
        requestAccepted(client.email, client.username, manager._id, rent.carid.carnumber, rent.daterent, manager.agencename)
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
        const client = await User.findOne({ _id: rent.clientid })
        client.notifications.push({
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'declinedrequest'
        })
        declinedRequest(client.email, client.username, rent.ownerid, rent.carid)
        await client.save()
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


