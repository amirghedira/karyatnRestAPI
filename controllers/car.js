const Car = require('../models/Car');
const Rent = require('../models/Rent')
const User = require('../models/User')
const cloudinary = require('../middleware/cloudinary')
const imageName = require('../middleware/imageName')
const { newCarPosted } = require('../middleware/sendMail')
const mongoose = require('mongoose')
exports.addCar = async (req, res) => {

    try {

        const car = await Car.findOne({ carnumber: req.body.carnumber })
        if (!car) {
            const imageurls = req.files.map(file => { return file.secure_url })
            const user = await User.findOne({ _id: req.user._id }).populate('clients')
            const newcar = new Car({
                carnumber: req.body.carnumber,
                ncinowner: req.body.ncinowner,
                brand: req.body.brand,
                color: req.body.color,
                price: req.body.price,
                transmission: req.body.transmission,
                climatisation: req.body.climatisation,
                doorscount: req.body.doorscount,
                seatscount: req.body.seatscount,
                images: imageurls,
                ownerid: req.user._id,
                address: user.address,
                addedDate: new Date().toISOString()
            })
            const car = await newcar.save()
            user.cars.push(newcar)
            await user.save()
            const clientIds = user.clients.map(client => { return client._id })
            await User.updateMany({ _id: { $in: [...clientIds] } }, {
                $push: {
                    notifications: {
                        _id: new mongoose.Types.ObjectId(),
                        userid: user._id,
                        carid: car._doc._id,
                        type: 'newcar'
                    }
                }
            })

            user.clients.forEach(client => {
                newCarPosted(client.email, client.username, car._doc._id, user.agencename)
            })
            res.status(200).json({ message: 'added successfully' })
            return;

        }

        res.status(409).json({ message: 'Car already exist' })

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

exports.getFreeCars = async (req, res, next) => {
    try {

        const user = await User.findOne({ _id: req.user._id }).populate('cars')
        let freecars = []
        user.cars.forEach(car => {
            if (car.state)
                freecars.push(car)
        })
        res.status(200).json({ freecars: freecars })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getallcars = async (req, res) => {

    try {
        const { page, limit } = req.query;
        const cars = await Car.paginate({}, { page: +page, limit: +limit })
        console.log(cars)
        res.status(200).json({ cars: cars })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getallFreeCars = async (req, res) => {

    try {
        const { page, limit } = req.query;
        const freeCars = await Car.paginate({ state: true }, { page: +page, limit: +limit })
        res.status(200).json({ freeCars: freeCars })

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

exports.getallRentedCars = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const rentedCars = await Car.paginate({ state: false }, { page: +page, limit: +limit })
        res.status(200).json({ rentedCars: rentedCars })

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
exports.getCars = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).populate('cars')
        res.status(200).json({ cars: user.cars })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getCar = async (req, res) => {

    try {

        const car = await Car.findOne({ _id: req.params.id })
        res.status(200).json({ car: car })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getRentedCars = async (req, res, next) => {

    try {

        const user = await User.findOne({ _id: req.user._id }).populate('cars')
        let rentedcars = []
        user.cars.forEach(car => {
            if (!car.state)
                rentedcars.push(car)
        })
        res.status(200).json({ rentedcars: rentedcars })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.deleteCar = async (req, res) => {

    try {

        const user = await User.findOne({ _id: req.user._id }).populate('cars')
        let usercarsid = user.cars.map(car => { return car._id })
        if (usercarsid.includes(req.params.id)) {
            const index = usercarsid.findIndex(carid => { return carid.toString() === req.params.id })
            user.cars[index].images.forEach(image => {

                cloudinary.uploader.destroy(imageName(image), (result, err) => {
                    if (err)
                        res.status(500).json({ error: err })
                });
            })
            user.cars.splice(index, 1)
            await user.save()
            await Car.deleteOne({ _id: req.params.id })
            await Rent.deleteMany({ carid: req.params.id })
            res.status(200).json({ message: 'car successfully deleted' })
            return;
        }

        res.status(404).json({ message: 'car not found' })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getCarHistory = async (req, res) => {

    try {

        const histories = await Rent.find({ $and: [{ carid: req.params.id }, { ended: true }] })
        res.status(200).json({ histories: histories })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getCarsCount = async (req, res, next) => {

    try {

        const count = await Car.countDocuments({ ncinowner: req.params.ncinowner })
        res.status(200).json({ count: count })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.updateCarPhoto = async (req, res) => {

    try {
        const car = await Car.findOne({ $and: [{ _id: req.params.id }, { ownerid: req.user._id }] })
        if (car) {
            cloudinary.uploader.destroy(req.body.oldimage, (result, err) => {
                if (err)
                    res.status(500).json({ error: err })
            });
            const imageindex = car.images.findIndex(carimage => { return carimage === req.body.oldimage })
            let newImages = car.images;
            newImages[imageindex] = req.file.secure_url
            await Car.updateOne({ $and: [{ _id: req.params.id }, { ownerid: req.user._id }] }, { $set: { images: newImages } })
            res.status(200).json({ message: 'car successfully updated' })
            return;
        }
        res.status(404).json({ message: 'car not found' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }

}

exports.updateCar = async (req, res) => {

    let ops = {};
    for (let obj of req.body) {
        ops[obj.propName] = obj.value
    }
    try {
        await Car.updateOne({ $and: [{ _id: req.params.id, ownerid: req.user._id }] }, { $set: ops })
        res.status(200).json({ message: 'car updated successfully' })
    } catch (error) {

        res.status(500).json({ message: err.message })
    }
}