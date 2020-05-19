const Rent = require('../models/Rent');
const Car = require('../models/Car');
const User = require('../models/User')
const mongoose = require('mongoose')
const io = require('socket.io-client')
const socket = io('http://karyatn.amir-ghedira.com')
const { SendRequest, rentEnded, requestAccepted, declinedRequest } = require('../middleware/sendMail')



exports.getRents = async (req, res) => {
    try {
        const rents = await Rent.find()
        res.status(200).json({ rents: rents })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.activeUsers = (req, res) => {

    socket.emit('users', 'hey');
    res.status(200).json({ message: 'done' })
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
                const client = await User.findById(req.user._id)
                const newNotification = {
                    _id: new mongoose.Types.ObjectId(),
                    userid: client,
                    carid: car,
                    read: false,
                    date: new Date().toISOString(),
                    type: 'request'
                }
                let manager = await User.findOneAndUpdate({ _id: req.params.ownerid }, {
                    $push: {
                        notifications: newNotification
                    }
                })
                SendRequest(manager.email, manager.username, client.username, client._id)
                socket.emit('sendnotification', { userid: rent.ownerid, notification: newNotification })
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

    const rent = await Rent.findById(rentid)
        .populate([{
            path: 'clientid'
        }, { path: 'carid' }, { path: 'ownerid' }])
    rent.active = false;
    rent.ended = true;
    await rent.save();
    const clientNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.ownerid,
        carid: rent.carid,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.clientid._id }, {
        $push: {
            notifications: clientNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.clientid._id, notification: clientNewNotification })
    const managerNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.clientid,
        carid: rent.carid,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.ownerid._id }, {
        $push: {
            notifications: managerNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.ownerid._id, notification: managerNewNotification })

    await Car.updateOne({ _id: rent.carid }, { $set: { state: true } })

    rentEnded(rent.clientid.email, rent.clientid.username, manager._id, car._id, car.carnumber)
    rentEnded(rent.ownerid.email, rent.ownerid.username, rent.clientid.username, rent.carid.carnumber)

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
            .populate([{
                path: 'clientid'
            }, { path: 'carid' }, { path: 'ownerid' }])

        rent.active = true
        await rent.save()
        await Car.updateOne({ _id: rent.carid._id }, { $set: { state: false } })
        const ownerNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.clientid,
            carid: rent.carid,
            type: 'activatedrent',
            read: false
        }
        const clientNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'activatedrent',
            read: false

        }
        await User.updateOne({ _id: rent.ownerid._id }, {
            $push: {
                notifications: ownerNotification
            }
        })
        await User.updateOne({ _id: rent.clientid._id }, {
            $push: {
                notifications: clientNotification
            }
        })
        socket.emit('sendnotification', { userid: rent.ownerid._id, notification: ownerNotification })
        socket.emit('sendnotification', { userid: rent.clientid._id, notification: clientNotification })


    } catch (error) {

        console.log(error)
    }
}
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Rent.findOne({ $and: [{ _id: req.params.id }, { ownerid: req.user._id }] })

        if (!reservation.active) {
            const newNotifcation = {
                _id: new mongoose.Types.ObjectId(),
                userid: reservation.ownerid,
                carid: reservation.carid,
                type: 'reservationdeleted',
                read:false
            }
            await User.updateOne({ _id: reservation.clientid }, {
                $push: {
                    notifications: newNotifcation
                }
            })
            await Rent.deleteOne({ $and: [{ _id: req.params.id }, { ownerid: req.user._id }] })
            socket.emit('sendnotification', { userid: reservation.clientid, notification: newNotifcation })
            res.status(200).json({ message: 'reservation deleted' })
            return;

        }
        res.status(409).json({ message: 'reservation is active' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}
exports.validateRequest = async (req, res, next) => {

    //tofix
    try {
        let rent = await Rent.findOne({ _id: req.body.rentid }).populate([{
            path: 'clientid'
        }, { path: 'carid' }, { path: 'ownerid' }])
        rent.validated = true;
        await rent.save()
        let manager = await User.findOne({ _id: req.user._id })
        const NewNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'requestaccepted',
            read: false,
            date: new Date().toISOString()
        }
        await User.updateOne({ _id: rent.clientid }, {
            $push: {
                notifications: NewNotification
            }
        })
        socket.emit('sendnotification', { userid: rent.clientid._id, notification: NewNotification })
        setTimeout(() => activateRentHandler(rent._id), new Date(rent.from).getTime() - new Date().getTime());
        setTimeout(() => endRentHandler(rent._id), new Date(rent.to).getTime() - new Date().getTime());
        requestAccepted(rent.clientid.email, rent.clientid.username, rent.ownerid._id, rent.carid.carnumber, rent.daterent, rent.ownerid.agencename)

        if (!manager.clients.includes(rent.clientid._id)) {
            manager.clients.push(rent.clientid._id)
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

        const rent = await Rent.findById(req.body.rentid).populate([{
            path: 'clientid'
        }, { path: 'carid' }, { path: 'ownerid' }])
        const newNotifcation = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.ownerid,
            carid: rent.carid,
            type: 'declinedrequest',
            read: false
        }
        await User.updateOne({ _id: rent.clientid._id }, { $push: { notifications: newNotifcation } })
        declinedRequest(rent.clientid.email, rent.clientid.username, rent.ownerid._id, rent.carid._id)
        socket.emit('sendnotification', { userid: rent.clientid._id, notification: newNotifcation })
        await Rent.deleteOne({ _id: req.body.rentid })
        res.status(200).json({ message: 'Request declined successfully' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.deleteRents = async (req, res) => {

    try {
        await Rent.deleteMany()
        res.status(200).json({ message: 'rent successfully deleted' })


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteAllRents = async (req, res) => {
    await Rent.deleteMany()
    res.status(200).json({ message: 'deleted' })
}