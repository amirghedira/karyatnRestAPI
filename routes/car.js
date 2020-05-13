const express = require('express')
const CarControllers = require('../controllers/car')
const router = express.Router();
const cloudinary = require('../middleware/cloudinary')
const checkAuth = require('../middleware/checkAuth')




router.get('/', checkAuth, CarControllers.getCars);

router.get('/allcars', CarControllers.getallcars)

router.get('/allcars/free', CarControllers.getallFreeCars)

router.get('/allcars/rented', CarControllers.getallRentedCars)

router.post('/', checkAuth, cloudinary.parser.array('carimages', 8), CarControllers.addCar);

router.get('/freecars', checkAuth, CarControllers.getFreeCars);

router.get('/rentedcars', checkAuth, CarControllers.getRentedCars);

router.get('/history/:id', checkAuth, CarControllers.getCarHistory)

router.get('/:id', CarControllers.getCar);

router.delete('/:id', checkAuth, CarControllers.deleteCar);






module.exports = router