const Car = require('../models/Car');
const Rent = require('../models/Rent')
const User = require('../models/User')




exports.addCar = (req, res) => {
    Car.findOne({ carnumber: req.body.carnumber })
        .exec()
        .then(car => {
            if (!car) {
                User.findOne({ _id: req.user._id })
                    .exec()
                    .then(user => {
                        const newcar = new Car({
                            carnumber: req.body.carnumber,
                            ncinowner: req.body.ncinowner,
                            brand: req.body.brand,
                            color: req.body.color,
                            price: req.body.price,
                            mileage: req.body.mileage,
                            state: true,
                            images: req.file.secure_url,
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
                                console.log(err)

                                res.status(500).json({ message: err })

                            })
                    })
                    .catch(err => {
                        console.log(err)

                        res.status(500).json({ message: err })

                    })
            } else {
                console.log('car exist')

                res.status(409).json({ message: 'Car already exist' })
            }
        })
        .catch(err => {
            console.log(err)

            res.status(500).json({ message: err })
        })

}


exports.getFreeCars = (req, res, next) => {
    User.findOne({ username: req.user.username })
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
        .catch(erre => {
            console.log(erre)
        })
}
exports.getCars = (req, res, next) => {
    User.findOne({ username: req.user.username })
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

    User.findOne({ username: req.user.username })
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
            console.log(err)
            res.status(500).json({ message: err })

        })

}

exports.updateState = (req, res, next) => {

    Car.updateOne({ _id: req.params.id }, { $set: { state: false } })

        .then(result => {
            res.status(200).json({ message: 'done' })
        })
        .catch(err => {
            console.log(err)
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

    User.findOne({ username: req.user.username })
        .exec()
        .then(user => {
            if (user.cars.includes(req.params.id)) {
                const index = user.cars.findIndex(carid => { return carid.toString() === req.params.id })
                console.log(index)
                if (index >= 0) {
                    user.cars.splice(index, 1)
                    user.save()
                        .then(resultsave => {

                            Car.deleteOne({ _id: req.params.id })
                                .exec()
                                .then(result => {
                                    console.log(result)
                                    res.status(200).json({ message: result })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).json({ message: err })

                                })
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).json({ message: err })

                        })
                }


            }
            else {

                res.status(404).json({ message: 'car not found' })
            }

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: err })

        })

}


exports.toFreeCar = (req, res, next) => {


    User.findOne({ username: req.user.username })
        .populate('cars')
        .exec()
        .then(user => {
            usercarNumbers = user.cars.map(car => { return car.carnumber })
            if (usercarNumbers.includes(req.params.carnumber)) {
                Car.updateOne({ carnumber: req.params.carnumber }, { $set: { state: true } })
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
