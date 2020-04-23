const Rent = require('../models/Rent');
const Car = require('../models/Car');


exports.addRent = (req, res, next) => {

    Car.findOne({ carnumber: req.body.carnumber })
        .then(car => {
            if (car) {
                if (car.state) {
                    const date = new Date().toISOString();
                    const rent = new Rent({
                        carid: car._id,
                        clientid: req.user._id,
                        totalprice: req.body.totalprice,
                        duration: req.body.duration,
                        daterent: date
                    })
                    rent.save()
                        .then(result => {
                            Car.updateOne({ carnumber: req.carnumber }, { $set: { state: false } })
                                .exec()
                                .then(result => {
                                    res.status(200).json({ message: 'Rent successfully added' })
                                })
                                .catch(err => {
                                    res.status(500).json({ message: err })
                                })
                        })
                        .catch(err => {
                            res.status(500).json({ message: err })
                        })

                } else {

                    res.status(404).json({ message: 'Car not found' });
                }

            } else {
                res.status(409).json({ message: 'Car already rented' });
            }
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

