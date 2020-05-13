const express = require('express');
const router = express.Router();
const Usercontroller = require('../controllers/user');
const cloudinary = require('../middleware/cloudinary');
const CheckAuth = require('../middleware/checkAuth')


router.get('/allusers', Usercontroller.getUsers);
router.get('/managers', Usercontroller.getManagers)
router.post('/', cloudinary.parser.array('userimages', 3), Usercontroller.addUser);
router.get('/', CheckAuth, Usercontroller.getUserWithToken)
router.patch('/userimage', CheckAuth, cloudinary.parser.single('userimage'), Usercontroller.updateUserImage);
router.delete('/allnotifications/:id', Usercontroller.deleteNotifications)
router.get('/clients', CheckAuth, Usercontroller.getClients)
router.delete('/notifications/:id', CheckAuth, Usercontroller.deleteNotification)
router.get('/informations', CheckAuth, Usercontroller.getUserInformations)
router.get('/archive', CheckAuth, Usercontroller.getUserArchive)
router.get('/:id', Usercontroller.getUser)
router.post('/login', Usercontroller.UserLogin);
router.post('/sendconfirmation', Usercontroller.sendConfirmation)
router.post('/confirmation', Usercontroller.userConfirmation)
router.post('/reset-password-mail', Usercontroller.sendresetPasswordMail)//new
router.get('/reset-password-auhorization/:token', Usercontroller.confirmPasswordReset) //new
router.patch('/reset-userpassword/:token', Usercontroller.resetPassword) //new
router.patch('/', CheckAuth, Usercontroller.updateUserInfo);
router.patch('/password', CheckAuth, Usercontroller.updatePassword)
router.patch('/markasread', CheckAuth, Usercontroller.markAsReadAllNotification)
router.patch('/markasread/:id', CheckAuth, Usercontroller.markAsReadNotification)



module.exports = router