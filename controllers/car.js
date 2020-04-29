const Car = require('../models/Car');
const Rent = require('../models/Rent')
const User = require('../models/User')
const cloudinary = require('../middleware/cloudinary')
const imageName = require('../middleware/imageName')



exports.addCar = (req, res) => {
    Car.findOne({ carnumber: req.body.carnumber })
        .exec()
        .then(car => {
            if (!car) {
                const imageurls = req.files.map(file => { return file.secure_url })
                User.findOne({ _id: req.user._id })
                    .exec()
                    .then(user => {
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
                            address: user.address
                        })
                        newcar.save()
                            .then(result => {
                                user.cars.push(newcar)
                                user.save()
                                    .then(result => {

                                        res.status(200).json({ message: 'added successfully' })
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
            } else {

                res.status(409).json({ message: 'Car already exist' })
            }
        })
        .catch(err => {

            res.status(500).json({ message: err })
        })

}


exports.getFreeCars = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .populate('cars')
        .exec()
        .then(user => {
            let freecars = []
            user.cars.forEach(car => {
                if (car.state)
                    freecars.push(car)
            })
            res.status(200).json({ freecars: freecars })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}


exports.getallcars = (req, res) => {
    Car.find()
        .exec()
        .then(cars => {
            res.status(200).json({ cars: cars })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.getCars = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .populate('cars')
        .exec()
        .then(user => {
            res.status(200).json({ cars: user.cars })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}
exports.getCar = (req, res, next) => {

    Car.findOne({ _id: req.params.id })
        .exec()
        .then(car => {
            res.status(200).json({ car: car })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}

exports.getRentedCars = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .populate('cars')
        .exec()
        .then(user => {
            let rentedcars = []
            user.cars.forEach(car => {
                if (!car.state)
                    rentedcars.push(car)
            })
            res.status(200).json({ rentedcars: rentedcars })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}

exports.updateState = (req, res, next) => {

    Car.updateOne({ _id: req.params.id }, { $set: { state: false } })

        .then(result => {
            res.status(200).json({ message: 'done' })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}


exports.deleteForme = (req, res, next) => {
    Car.deleteOne({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json('done')

        })
        .catch(err => {
            res.status(500).json('eroor')
        })
}

exports.deleteCar = (req, res, next) => {

    User.findOne({ _id: req.user._id })
        .populate('cars')
        .exec()
        .then(user => {
            let carsid = user.cars.map(car => { return car._id })
            if (carsid.includes(req.params.id)) {
                const index = carsid.findIndex(carid => { return carid.toString() === req.params.id })
                if (index >= 0) {
                    user.cars[index].images.forEach(image => {

                        cloudinary.uploader.destroy(imageName(image), (result, err) => {
                            if (err)
                                res.status(500).json({ error: err })
                        });
                    })
                    user.cars.splice(index, 1)
                    user.save()
                        .then(result => {

                            Car.deleteOne({ _id: req.params.id })
                                .exec()
                                .then(result => {
                                    res.status(200).json({ message: result })
                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })

                                })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })

                        })
                }


            }
            else {

                res.status(404).json({ message: 'car not found' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}


exports.toFreeCar = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .exec()
        .then(user => {
            const index = user.cars.findIndex(carid => {
                return carid.toString() === req.params.id
            })
            if (index => 0) {
                Car.updateOne({ _id: req.params.id }, { $set: { state: true } })
                    .exec()
                    .then(result => {
                        res.status(200).json({ message: 'car successfully updated' })
                    })
                    .catch(err => {
                        res.status(500).json({ message: err })

                    })

            } else {
                res.status(404).json({ message: 'car not found' })

            }
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}
exports.getCarHistory = (req, res, next) => {

    Rent.find({ carnumber: req.params.carnumber })
        .exec()
        .then(histories => {
            res.status(200).json({ histories: histories })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}

exports.getCarsCount = (req, res, next) => {

    Car.countDocuments({ ncinowner: req.params.ncinowner })
        .exec()
        .then(count => {
            res.status(200).json({ count: count })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}
