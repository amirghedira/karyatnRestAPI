const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cloudinary = require('../middleware/cloudinary')
const ImageName = require('../middleware/imageName')

exports.addUser = (req, res, next) => {

    const urls = req.files.map(file => { return file.secure_url })
    User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
        .exec()
        .then(user => {
            if (user)
                res.status(409).json({ message: 'user already exists' })
            else {
                bcrypt.hash(req.body.password, 11)
                    .then(password => {
                        const user = new User({
                            ncin: req.body.ncin,
                            username: req.body.username,
                            password: password,
                            email: req.body.email,
                            access: req.body.access,
                            name: req.body.name,
                            surname: req.body.surname,
                            age: req.body.age,
                            licencenum: req.body.licencenum,
                            birthday: req.body.birthday,
                            address: req.body.address,
                            profileimg: urls[0],
                            ncinimg: urls[1],
                            joindate: new Date(),
                            notifications: [],
                            agencename: req.body.agencename,
                            phonenum: req.body.phonenum
                        })
                        user.save()
                            .then(result => {
                                res.status(200).json({ message: 'User successfully added' })
                            })
                            .catch(err => {

                                res.status(500).json({ message: err })
                            })
                    })
                    .catch(err => {
                        res.status(500).json({ message: err })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
}

exports.getUsers = (req, res) => {
    User.find()
        .select('-password')
        .exec()
        .then(users => {
            res.status(200).json({ users: users })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}


exports.getUsersWithCars = (req, res) => {
    User.find({ access: 'a' })
        .populate('cars')
        .select('-password')
        .then(users => {
            res.status(200).json({ users: users })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}

exports.getUser = (req, res) => {

    User.findOne({ _id: req.params.id })
        .select('-password')
        .exec()
        .then(user => {
            res.status(200).json({ user: user })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}
exports.getUserByusrName = (req, res) => {
    User.findOne({ username: req.params.username })
        .select('-password')
        .exec()
        .then(user => {
            res.status(200).json({ user: user })

        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}

exports.UserLogin = (req, res) => {
    User.findOne({ username: req.body.username })
        .exec()
        .then(user => {
            if (user) {
                bcrypt.compare(req.body.password, user.password)
                    .then(result => {
                        if (result) {

                            const token = jwt.sign({
                                _id: user._id,
                                username: user.username,
                                email: user.email
                            }, process.env.JWT_SECRET_KEY)

                            res.status(200).json({ user: { token: token, ...user._doc, password: null } })

                        } else {
                            res.status(404).json({ message: 'Authentication failed' })
                        }

                    })
                    .catch(err => {
                        console.log(err)

                        res.status(500).json({ message: err })

                    })
            } else {
                res.status(404).json({ message: 'Authentication failed' })
            }
        })
        .catch(err => {
            console.log(err)

            res.status(500).json({ message: err })

        })
}


exports.getUserbyToken = (req, res) => {
    if (req.user) {
        User.findOne({ _id: req.user._id })
            .select('-password')
            .then(user => {
                res.status(200).json({ user: user })
            })
            .catch(err => {
                res.status(500).json({ message: err })

            })
    }
    else
        res.status(401).json({ message: 'auth failed' })
}

exports.getUserbyUsername = (req, res, next) => {

    User.find({ username: req.params.username })
        .select('-password')
        .then(user => {
            res.status(200).json({ user: user })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}

exports.deleteUser = (req, res) => {

    User.deleteOne({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'done' })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}

exports.getUserInformations = (req, res) => {

    let info = {};
    User.findOne({ _id: req.user._id })
        .select('-password')
        .then(user => {
            info.carscount = user.cars.length;
            info.clientscount = user.clients.length
            res.status(200).json({ info: info })

        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}

exports.updateUserInfo = (req, res) => {

    let ops = {};
    for (let obj of req.body) {
        ops[obj.propName] = obj.value
    }
    User.updateOne({ _id: req.user._id }, { $set: ops })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'user successfully updated' })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: err })

        })

}

exports.updateUserImage = (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            if (user) {
                cloudinary.uploader.destroy(ImageName(user.profileimg), (result, err) => {
                    console.log(err)
                })
                user.profileimg = req.file.secure_url;
                user.save()

                    .then(result => {

                        res.status(200).json({ message: 'user image updated successfully' })

                    })
                    .catch(err => {
                        res.status(500).json({ message: err })
                    })
            }
            else
                res.status(500).json({ message: 'user not found' })
        })
        .catch(err => {

            res.status(500).json({ message: err })

        })
}

