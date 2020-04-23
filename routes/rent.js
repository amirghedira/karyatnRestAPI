const express = require('express')
const router = express.Router();
const RentController = require('../controllers/rent')
const checkAuth = require('../middleware/checkAuth')

router.post('/', checkAuth, RentController.addRent);
router.get('client-history/:ncin', RentController.getClienthistory)
router.get('client-count/:ncin', RentController.getClientCount)

module.exports = router