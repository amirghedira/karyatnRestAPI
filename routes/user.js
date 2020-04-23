const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Usercontroller = require('../controllers/user');
const cloudinary = require('../middelware/cloudinary');
const CheckAuth = require('../middelware/checkAuth')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.get('/', Usercontroller.getUsers);
router.get('/:id', Usercontroller.getUser)
router.get('/userwithcars', Usercontroller.getUsersWithCars)
router.get('/bytoken', CheckAuth, Usercontroller.getUserbyToken)
router.get('/username/:username', Usercontroller.getUserbyUsername)
router.get('/informations', CheckAuth, Usercontroller.getUserInformations)
router.get('/:ncin', Usercontroller.getUser);
router.post('/', cloudinary.parser.array('userimages', 3), Usercontroller.addUser);
router.post('/login', Usercontroller.UserLogin);
router.patch('/', Usercontroller.updateUser);
router.delete('/:id', Usercontroller.deleteUser);



module.exports = router