const express=require('express');
const userController=require('../Controllers/userController');
const router=express.Router();
const authController=require('../Controllers/authController');
const multer=require('multer')
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);


router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

//protects all routes after the middleware
router.use(authController.protect)

router.route('/updateMyPassword').patch(
    authController.updatePassword
  );
router.get('/me',userController.getMe,userController.getUser)
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)  
router.delete('/deleteMe',userController.deleteMe)  

router.use(authController.restrictTo('admin'))

router.route('/').get(userController.getAllUser).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)



module.exports=router;