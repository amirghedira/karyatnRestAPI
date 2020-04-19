const express = require('express')
const CarControllers = require('../controllers/car')
const router = express.Router();
const cloudinary = require('../middelware/cloudinary')
const checkAuth = require('../middelware/checkAuth')



router.get('/', checkAuth, CarControllers.getCars);

router.post('/freecar/:carnumber', checkAuth, CarControllers.toFreeCar);

router.post('/', checkAuth, cloudinary.parser.single('carimage'), CarControllers.addCar);

router.get('/freecars', checkAuth, CarControllers.getFreeCars);

router.get('/rentedcars', checkAuth, CarControllers.getRentedCars);

router.get('/history', CarControllers.getCarHistory)


router.get('/:carnumber', CarControllers.getCar);

router.get('/carcount/:ncinowner', CarControllers.getCarsCount)

router.delete('/:id', CarControllers.deleteCar);



module.exports = router