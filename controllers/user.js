const User = require('../models/User');
const Rent = require('../models/Rent')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cloudinary = require('../middleware/cloudinary')
const ImageName = require('../middleware/imageName')
const { WelcomeEmail, resetPasswordMail } = require('../middleware/sendMail')

exports.addUser = async (req, res, next) => {

    const urls = req.files.map(file => { return file.secure_url })
    const user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
    if (!user) {
        const hashedpw = await bcrypt.hash(req.body.password, 11)
        const user = new User({
            ncin: req.body.ncin,
            username: req.body.username,
            password: hashedpw,
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
            joindate: new Date().toISOString(),
            notifications: [],
            agencename: req.body.agencename,
            phonenum: req.body.phonenum
        })
        const result = await user.save()
        const token = jwt.sign(
            {
                _id: result._doc._id,
                username: result._doc.username,
                email: result._doc.email
            }, process.env.JWT_SECRET_KEY
        )

        WelcomeEmail(result._doc.email, result._doc.username, token)
        res.status(201).json({ message: 'User successfully added' })
        return;
    }
    res.status(404).json({ message: 'user already exists' })

}

exports.getUsers = async (req, res) => {

    try {
        const users = await User.find().select('-password')
        res.status(200).json({ users: users })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getClients = async (req, res) => {

    try {
        const { clients } = await User.findOne({ _id: req.user._id }).populate('clients').select('-password')
        res.status(200).json({ clients: clients })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}


exports.getUsersWithCars = async (req, res) => {

    try {
        const users = await User.find({ access: 'a' }).populate('cars').select('-password')
        res.status(200).json({ users: users })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getUser = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.params.id }).select('-password')
        res.status(200).json({ user: user })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

exports.sendresetPasswordMail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY
            )

            resetPasswordMail(user.email, user.username, token)
            res.status(200).json({ message: 'Email sent' })
            return;

        }
        res.status(404).json({ message: 'User with this email not found' })
    } catch (error) {
        res.status(500).json({ message: error.message })
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
        const decodeduser = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)
        const hashedpw = await bcrypt.hash(req.body.newpassword, 11);
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

exports.sendConfirmation = async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY
            )
            WelcomeEmail(user.email, user.username, token)
            res.status(200).json({ message: 'Email sent' })
            return;
        }
        res.status(404).json({ message: 'User not found' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.UserLogin = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
            .populate([{
                path: 'notifications.userid', select: 'name surname profileimg'
            }, { path: 'notifications.car', select: 'brand carnumber images' }])
        if (user) {
            const result = await bcrypt.compare(req.body.password, user.password)
            if (result) {

                const token = jwt.sign({
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY)

                res.status(200).json({ user: { token: token, ...user._doc, password: null } })
                return;
            }
            res.status(404).json({ message: 'Authentication failed' })
            return;

        }
        res.status(404).json({ message: 'Authentication failed' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
//user : surname name profileimage , car: brand serie image
exports.getUserWithToken = (req, res) => {

    User.findOne({ _id: req.user._id })
        .populate([{
            path: 'notifications.userid', select: 'name surname profileimg'
        }, { path: 'notifications.car', select: 'brand carnumber images' }])
        .exec()
        .then(user => {
            res.status(200).json({ user: user })

        })
        .catch(error => {
            res.status(500).json({ message: error.message })

        })
}


exports.getUserInformations = async (req, res) => {

    try {
        let info = {};
        const user = await User.findOne({ _id: req.user._id }).select('-password')
        info.carscount = user.cars.length;
        info.clientscount = user.clients.length
        let userRents = await Rent.find({ $and: [{ owner: req.user._id }, { validated: true }] })

        info.activerents = 0;
        info.inactiverents = 0;
        info.totalrevenues = 0;
        info.totalRents = 0;
        info.mouthsProfits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        info.yearsProfits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        userRents.forEach(userRent => {
            if (!userRent.ended) {

                if (userRent.active)
                    info.activerents++;
                else
                    info.inactiverents++;
            } else {

                info.totalrevenues += +userRent.totalprice
                if (new Date().getFullYear().toString() === userRent.from.toISOString().split('-')[0]) {
                    let month = userRent.from.toISOString().split('-')[1]
                    if (month < 10)
                        month = month.split('0')[1];
                    info.mouthsProfits[month - 1] += +userRent.totalprice;
                }
                info.yearsProfits[new Date().getFullYear() - +userRent.from.toISOString().split('-')[0]] += +userRent.totalprice

            }
            info.totalRents++;
        });

        res.status(200).json({ info: info })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

exports.getUserArchive = async (req, res) => {

    try {

        const archives = await Rent.find({ $and: [{ owner: req.user._id }, { ended: true }] })
        res.status(200).json({ archives: archives })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.updateUserInfo = async (req, res) => {

    let ops = {};
    for (let obj of req.body) {
        ops[obj.propName] = obj.value
    }
    try {
        await User.updateOne({ _id: req.user._id }, { $set: ops })
        res.status(200).json({ message: 'user updated successfully' })
    } catch (error) {

        res.status(500).json({ message: err.message })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })
        const result = await bcrypt.compare(req.body.oldPassword, user.password)
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
exports.updateUserImage = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.user._id })
        if (user) {
            cloudinary.uploader.destroy(ImageName(user.profileimg), (result, err) => {

            })
            user.profileimg = req.file.secure_url;
            await user.save()
            res.status(200).json({ message: 'user image updated successfully' })
            return;

        }
        res.status(404).json({ message: 'user not found' })

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

exports.deleteNotification = async (req, res) => {

    try {

        const user = await User.findOne({ _id: req.user._id })
        const index = user.notifications.findIndex(notification => { return notification._id.toString() === req.params.id })
        user.notifications.splice(index, 1)
        await user.save()
        res.status(200).json({ message: 'notification removed' })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }

}

exports.deleteNotifications = async (req, res, next) => {
    try {

        await User.updateOne({ _id: req.user._id }, { $set: { notifications: [] } })
        res.status(200).json({ message: 'notifications cleared' })
    } catch (error) {

        res.status(500).json({ message: error.message })
    }
}

exports.getManagers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const managers = await User.paginate({ access: 'a' }, { page: +page, limit: +limit })
        res.status(200).json({ managers: managers })

    } catch (error) {

        res.status(500).json({ message: error.message })
    }

}

exports.markAsReadAllNotification = async (req, res) => {

    try {

        const user = await User.findOne({ _id: req.user._id });
        const newNotifications = user.notifications;
        newNotifications.forEach(notification => {
            notification.read = true;
        })
        await User.updateOne({ _id: req.user._id }, { $set: { notifications: newNotifications } })
        res.status(200).json({ message: 'notification updated' });

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

exports.clearUseClients = async (req, res) => {

    await User.updateOne({ _id: req.params.id }, { $set: { clients: [] } })
    res.status(200).json({ message: 'done' })
}

exports.markAsReadNotification = async (req, res) => {

    try {

        const user = await User.findOne({ _id: req.user._id });
        const index = user.notifications.findIndex(notification => notification._id.toString() === req.params.id)
        user.notifications[index].read = true;
        await user.save()
        res.status(200).json({ message: 'notification updated' });

    } catch (error) {

        res.status(500).json({ message: error.message })

    }


}
exports.deleteClient = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.user._id })
        const clientindex = user.clients.findIndex(client => client.toString() === req.params.id)
        if (clientindex >= 0) {
            let newClients = user.clients;
            newClients.splice(clientindex, 1);
            user.clients = newClients;
            await user.save()
            return res.status(200).json({ message: 'user updated' })
        }
        return res.status(404).json({ message: 'user not found' })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })

    }
}

exports.subscribeTo = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user.clients.includes(req.user._id)) {

            user.clients.push(req.user._id)
            user.save()
            return res.status(200).json({ message: 'subscription done' })

        }
        res.status(409).json({ message: 'you are already subscribed' })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }

}