const express = require('express')
const CarControllers = require('../controllers/car')
const router = express.Router();
const cloudinary = require('../middleware/cloudinary')
const checkAuth = require('../middleware/checkAuth')



router.get('/allcars', CarControllers.getallcars)

router.delete('/delete/:id', CarControllers.deleteForme)

router.get('/', checkAuth, CarControllers.getCars);

router.patch('/freecar/:id', checkAuth, CarControllers.toFreeCar);

router.post('/', checkAuth, cloudinary.parser.array('carimages', 8), CarControllers.addCar);

router.get('/freecars', checkAuth, CarControllers.getFreeCars);

router.get('/rentedcars', checkAuth, CarControllers.getRentedCars);

router.get('/history', CarControllers.getCarHistory)


router.get('/:id', CarControllers.getCar);

router.get('/carcount/:ncinowner', CarControllers.getCarsCount)

router.delete('/:id', checkAuth, CarControllers.deleteCar);




module.exports = router