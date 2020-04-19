const Client = require('../models/Client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


exports.addClient = (req, res, next) => {

    const urls = req.files.map(file => { return file.secure_url })
    Client.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
        .exec()
        .then(client => {
            if (client)
                res.status(409).json({ message: 'Client already exists' })
            else {
                bcrypt.hash(req.body.password, 11)
                    .then(password => {
                        const client = new Client({
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
                            backgroundimg: null,
                            ncinimg: urls[1],
                            joindate: new Date(),
                            agencename: req.body.agencename,
                            phonenum: req.body.phonenum
                        })
                        client.save()
                            .then(result => {
                                res.status(200).json({ message: 'Client successfully added' })
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

exports.getClients = (req, res) => {

    Client.find()
        .exec()
        .then(clients => {
            res.status(200).json({ clients: clients })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}

exports.getClient = (req, res) => {

    Client.findOne({ ncin: req.params.ncin })
        .exec()
        .then(client => {
            res.status(200).json({ client: client })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}
exports.getClientByusrName = (req, res) => {
    Client.findOne({ username: req.params.username })
        .exec()
        .then(client => {
            res.status(200).json({ client: client })

        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}

exports.clientLogin = (req, res) => {
    Client.findOne({ username: req.body.username })
        .exec()
        .then(client => {
            if (client) {
                bcrypt.compare(req.body.password, client.password)
                    .then(result => {
                        if (result) {
                            const token = jwt.sign({
                                username: client.username,
                                email: client.email
                            }, process.env.JWT_SECRET_KEY)

                            res.status(200).json({ token: token, profileimg: client.profileimg })

                        } else {

                            res.status(404).json({ message: 'Authentication failed' })
                        }

                    })
                    .catch(err => {
                        res.status(500).json({ message: err })

                    })
            } else {
                res.status(404).json({ message: 'Authentication failed' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}


exports.getClientbyToken = (req, res) => {
    if (req.user)
        Client.findOne({ username: req.user.username })
            .select('-password')
            .then(user => {
                res.status(200).json({ user: user })
            })
            .catch(err => {
                res.status(500).json({ message: err })

            })
    else
        res.status(401).json({ message: 'auth failed' })
}

exports.getClientbyUsername = (req, res, next) => {

    Client.find({ username: req.params.username })
        .then(user => {
            res.status(200).json({ user: user })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })

}

exports.deleteClient = (req, res) => {

    Client.deleteOne({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json({ message: 'done' })
        })
        .catch(err => {
            res.status(500).json({ message: err })

        })
}