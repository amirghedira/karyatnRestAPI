const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const ClientController = require('../controllers/client');
const cloudinary = require('../middelware/cloudinary');
const CheckAuth = require('../middelware/checkAuth')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.get('/', ClientController.getClients);
router.get('/clientwithcars', ClientController.getClientsWithCars)
router.get('/bytoken', CheckAuth, ClientController.getClientbyToken)
router.get('/username/:username', ClientController.getClientbyUsername)
router.get('/informations', CheckAuth, ClientController.getClientInformations)
router.get('/:ncin', ClientController.getClient);
router.post('/', cloudinary.parser.array('clientimages', 3), ClientController.addClient);
router.post('/login', ClientController.clientLogin);
router.patch('/', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);



module.exports = router