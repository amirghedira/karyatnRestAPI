const express = require('express')
const CarControllers = require('../controllers/car')
const router = express.Router();



router.get('/', CarControllers.getCars);

router.post('/', CarControllers.addCar);

router.get('/:carnumber', CarControllers.getCar);

router.get('/freecars', CarControllers.getFreeCars);

router.get('/rentedcars', CarControllers.getRentedCars);

router.get('/carcount/:ncinowner', CarControllers.getCarsCount)

router.get('/history', CarControllers.getCarHistory)

router.delete('/:carnumber', CarControllers.deleteCar);

router.patch('/freecar', CarControllers.toFreeCar);


module.exports = router