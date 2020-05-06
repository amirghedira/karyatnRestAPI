const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cloudinary = require('../middleware/cloudinary')
const ImageName = require('../middleware/imageName')
const sendMail = require('../middleware/sendMail')

exports.addUser = (req, res, next) => {

    const urls = req.files.map(file => { return file.secure_url })
    if (urls[0])
        console.log(urls[0])
    else
        urls[0] = null
    User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
        .exec()
        .then(user => {
            if (user)
                res.status(404).json({ message: 'user already exists' })
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
                            profileimg: urls[0] ? urls[0] : null,
                            ncinimg: urls[1],
                            joindate: new Date(),
                            notifications: [],
                            agencename: req.body.agencename,
                            phonenum: req.body.phonenum
                        })
                        user.save()
                            .then(result => {
                                const token = jwt.sign(
                                    {
                                        _id: result._doc._id,
                                        username: result._doc.username,
                                        email: result._doc.email
                                    }, process.env.JWT_SECRET_KEY
                                )
                                sendMail(result._doc.email,
                                    "Email Confirmation",
                                    `please click this <a href=http://localhost:4200/confirmation/${token}>Link<a> to confirm your account`)
                                res.status(201).json({ message: 'User successfully added' })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({ message: err.message })
                            })
                    })
                    .catch(err => {
                        res.status(500).json({ message: err.message })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
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
            res.status(500).json({ message: err.message })

        })
}

exports.getClients = (req, res) => {

    User.findOne({ _id: req.user._id })
        .populate('clients')
        .exec()
        .then(user => {
            res.status(200).json({ clients: user.clients })
        })
        .catch(err => {
            res.status(500).json({ message: err.message })

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

            res.status(500).json({ message: err.message })

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

            res.status(500).json({ message: err.message })
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
            res.status(500).json({ message: err.message })

        })
}
exports.sendresetPasswordMail = async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email
            }, process.env.JWT_SECRET_KEY
        )
        sendMail(user.email,
            "Reset your password",
            `please click this <a href=http://localhost:4200/resetpassword/${token}>Link<a> to reset your password`)
        res.status(200).json({ message: 'Email sent' })

    }
    res.status(404).json({ message: 'User with this email not found' })
}
exports.clearClients = async (req, res) => {

    try {
        await User.updateOne({ _id: req.params.id }, { $set: { clients: [] } })
        res.status(200).json({ message: 'done' })
    } catch (error) {
        console.log(error)
    }

}
exports.confirmPasswordReset = async (req, res) => {

    try {
        jwt.verify(req.params.token, process.env.JWT_SECRET_KEY);
        res.status(200).json({ message: 'User is valide' });
    } catch (error) {
        res.status(401).json({ message: 'user isn\'t valide' });
    }
}
exports.resetPassword = async (req, res) => {
    try {
        let decodeduser = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)
        let hashedpw = await bcrypt.hash(req.body.newpassword, 11);
        await User.updateOne({ _id: decodeduser._id }, { $set: { password: hashedpw } })
        res.status(200).json({ message: 'User password successfully updated' })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.userConfirmation = async (req, res) => {

    try {
        const user = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY)
        await User.updateOne({ _id: user._id }, { $set: { confirmed: true } })
        res.status(200).json({ message: 'user successfully confirmed' })

    } catch (error) {
        res.status(401).json({ message: 'User confirmation failed' })
    }
}

exports.sendConfirmation = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                const token = jwt.sign(
                    {
                        _id: user._id,
                        username: user.username,
                        email: user.email
                    }, process.env.JWT_SECRET_KEY
                )
                sendMail(user.email,
                    "Email Confirmation",
                    `please click this <a href=http://localhost:4200/confirmation/${token}>Link<a> to confirm your account`)
                res.status(200).json({ message: 'Email sent' })
            } else
                res.status(404).json({ message: 'User not found' })

        })
        .catch(err => {
            res.status(500).json({ message: err.message })
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
                        res.status(500).json({ message: err.message })

                    })
            } else {
                res.status(404).json({ message: 'Authentication failed' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err.message })

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
                res.status(500).json({ message: err.message })

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
            res.status(500).json({ message: err.message })

        })

}

exports.deleteUser = (req, res) => {

    User.deleteOne({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'done' })
        })
        .catch(err => {
            res.status(500).json({ message: err.message })

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
            res.status(500).json({ message: err.message })

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
            res.status(500).json({ message: err.message })

        })

}
exports.updatePassword = async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.user._id })
        let result = await bcrypt.compare(req.body.oldPassword, user.password)
        if (result) {
            user.password = await bcrypt.hash(req.body.newPassword, 11);
            await user.save()
            res.status(200).json({ message: 'Password successfully updated' })
            return;
        }
        res.status(400).json({ message: 'Passwords didn\'t match' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }


}
exports.updateUserImage = (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            if (user) {
                cloudinary.uploader.destroy(ImageName(user.profileimg), (result, err) => {

                })
                user.profileimg = req.file.secure_url;
                user.save()

                    .then(result => {

                        res.status(200).json({ message: 'user image updated successfully' })

                    })
                    .catch(err => {
                        res.status(500).json({ message: err.message })
                    })
            }
            else
                res.status(500).json({ message: 'user not found' })
        })
        .catch(err => {

            res.status(500).json({ message: err.message })

        })
}

exports.deleteNotification = (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            const index = user.notifications.findIndex(notification => { return notification._id.toString() === req.params.id })
            user.notifications.splice(index, 1)
            user.save()
                .then(result => {
                    res.status(200).json({ message: 'notification removed' })

                })
                .catch(err => {
                    res.status(500).json({ error: err })

                })
        })
        .catch(err => {
            res.status(500).json({ error: err })

        })
}
exports.deleteNotifications = (req, res, next) => {
    User.updateOne({ _id: req.params.id }, { $set: { notifications: [] } })
        .then(result => {
            res.status(200).json({ message: 'notifications cleared' })
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
}

exports.getManagers = (req, res) => {
    User.find({ access: 'a' })
        .then(managers => {
            res.status(200).json({ managers: managers })
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
}