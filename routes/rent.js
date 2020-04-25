const express = require('express')
const router = express.Router();
const RentController = require('../controllers/rent')
const checkAuth = require('../middleware/checkAuth')

router.delete('/:id', RentController.deleteRent)
router.post('/:ownerid', checkAuth, RentController.sendRequest);
router.patch('/validate', checkAuth, RentController.validateRequest)
router.patch('/decline', checkAuth, RentController.declineRequest)
router.get('/unvalidated', checkAuth, RentController.getUnValidatedRequests)
router.get('/', RentController.getRents)
router.get('client-history/:ncin', RentController.getClienthistory)
router.get('client-count/:ncin', RentController.getClientCount)

module.exports = router