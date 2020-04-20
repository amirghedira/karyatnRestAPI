const Car = require('../models/Car');
const Rent = require('../models/Rent')
const Client = require('../models/Client')




exports.addCar = (req, res) => {
    Car.findOne({ carnumber: req.body.carnumber })
        .exec()
        .then(car => {
            if (!car) {
                const newcar = new Car({
                    carnumber: req.body.carnumber,
                    ncinowner: req.body.ncinowner,
                    brand: req.body.brand,
                    color: req.body.color,
                    price: req.body.price,
                    mileage: req.body.mileage,
                    state: true,
                    images: req.file.secure_url,
                })
                newcar.save()
                    .then(result => {
                        Client.updateOne({ username: req.user.username }, { $push: { cars: newcar } })
                            .then(user => {

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
    Client.findOne({ username: req.user.username })
        .populate('cars')
        .exec()
        .then(client => {
            let freecars = []
            client.cars.forEach(car => {
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
    Client.findOne({ username: req.user.username })
        .populate('cars')
        .exec()
        .then(client => {
            res.status(200).json({ cars: client.cars })
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

    Client.findOne({ username: req.user.username })
        .populate('cars')
        .exec()
        .then(client => {
            let rentedcars = []
            client.cars.forEach(car => {
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

exports.clearClientcars = (req, res) => {

    Client.updateOne({ _id: req.params.id }, { $set: { cars: [] } })
        .exec()
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

    Client.findOne({ username: req.user.username })
        .exec()
        .then(client => {
            if (client.cars.includes(req.params.id)) {
                const index = client.cars.findIndex(carid => { return carid.toString() === req.params.id })
                console.log(index)
                if (index >= 0) {
                    client.cars.splice(index, 1)
                    client.save()
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


    Client.findOne({ username: req.user.username })
        .populate('cars')
        .exec()
        .then(client => {
            clientcarNumbers = client.cars.map(car => { return car.carnumber })
            if (clientcarNumbers.includes(req.params.carnumber)) {
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
