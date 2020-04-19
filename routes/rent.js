const express = require('express')
const router = express.Router();
const RentController = require('../controllers/rent')

router.post('/', RentController.addLocation);
router.get('client-history/:ncin', RentController.getClienthistory)
router.get('client-count/:ncin', RentController.getClientCount)

module.exports = router