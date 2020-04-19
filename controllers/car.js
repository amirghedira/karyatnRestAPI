const Car = require('../models/Car');
const Rent = require('../models/Rent')

exports.addCar = (req, res) => {

    Car.findOne({ carnumber: req.body.carnumber })
        .exec()
        .then(car => {
            if (!car) {
                const car = new Car({
                    carnumber: req.body.carnumber,
                    ncinowner: req.body.ncinowner,
                    brand: req.body.brand,
                    color: req.body.color,
                    price: req.body.price,
                    mileage: req.body.mileage,
                    state: true,
                    images: req.body.images,
                })
                car.save()
                    .then(result => {
                        res.status(200).json({ message: 'Car successfully added' })
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

    Car.find({ state: true })
        .exec()
        .then(cars => {
            res.status(200).json({ cars: cars })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}

exports.getCars = (req, res, next) => {

    Car.find()
        .exec()
        .then(cars => {
            res.status(200).json({ cars: cars })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}
exports.getCar = (req, res, next) => {

    Car.findOne({ carnumber: req.params.carnumber })
        .exec()
        .then(car => {
            res.status(200).json({ car: car })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

}

exports.getRentedCars = (req, res, next) => {

    Car.find({ state: false })
        .exec()
        .then(cars => {
            res.status(200).json({ cars: cars })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}




exports.deleteCar = (req, res, next) => {

    Car.deleteOne({ carnumber: req.params.carnumber })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'Car deleted successfully' })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}


exports.toFreeCar = (req, res, next) => {

    Car.updateOne({ carnumber: req.params.carnumber }, { $set: { state: true } })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'car successfully updated' })
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
