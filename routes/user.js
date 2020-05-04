const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Usercontroller = require('../controllers/user');
const cloudinary = require('../middleware/cloudinary');
const CheckAuth = require('../middleware/checkAuth')
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.get('/', Usercontroller.getUsers);
router.get('/managers', Usercontroller.getManagers)
router.post('/', cloudinary.parser.array('userimages', 3), Usercontroller.addUser);
router.get('/bytoken', CheckAuth, Usercontroller.getUserbyToken)
router.patch('/userimage', CheckAuth, cloudinary.parser.single('userimage'), Usercontroller.updateUserImage);
router.delete('/allnotifications/:id', Usercontroller.deleteNotifications)
router.delete('/notifications/:id', CheckAuth, Usercontroller.deleteNotification)
router.get('/:id', Usercontroller.getUser)
router.get('/username/:username', Usercontroller.getUserbyUsername)
router.get('/informations', CheckAuth, Usercontroller.getUserInformations)
router.post('/login', Usercontroller.UserLogin);
router.post('/confirmation', Usercontroller.userConfirmation)
router.patch('/', CheckAuth, Usercontroller.updateUserInfo);
router.delete('/:id', Usercontroller.deleteUser);



module.exports = router