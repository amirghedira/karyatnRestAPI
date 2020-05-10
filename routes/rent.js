const express = require('express')
const router = express.Router();
const RentController = require('../controllers/rent')
const checkAuth = require('../middleware/checkAuth')

router.delete('/:id', RentController.deleteRent)
router.post('/:ownerid', checkAuth, RentController.sendRequest);
router.patch('/endrent/:id', checkAuth, RentController.endRent)//todo
router.get('/active', checkAuth, RentController.getActiveRents)//todo
router.patch('/validate', checkAuth, RentController.validateRequest)
router.patch('/decline', checkAuth, RentController.declineRequest)
router.get('/unvalidated', checkAuth, RentController.getUnValidatedRequests)
router.get('/reservations', checkAuth, RentController.getReservations)//todo
router.get('/', RentController.getRents)

module.exports = router