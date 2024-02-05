
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const multer=require('multer')
const catchAsync=require('./../utils/catchAsync');
const factory=require('./handlerFactory')
const sharp=require('sharp')

// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'public/img/users')
//     },
//     filename:(req,file,cb)=>{
//         //user-568493533534a-333455667.jpeg
//         const ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })
const multerStorage=multer.memoryStorage()

const multerFilter= (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else{
        cb(new AppError('Not an image plz upload only images',400),false)
    }
}

const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter  
})


exports.uploadUserPhoto=upload.single('photo')

exports.resizeUserPhoto=catchAsync(async(req,res,next)=>{
    if(!req.file) return next();
   req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`
      await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)
next()
    }
)
const filterObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)){
            newObj[el]=obj[el];
        }
    })
   return newObj;
}
// const APIFeatures = require('./../utils/apiFeatures');
// exports.getAlluser=catchAsync(async (req,res)=>{
//     const users= await User.find();
//     res.status(200).json({
//       status: 'success',
//       results: users.length,
//       data: {
//         users:users,
//       },
//     });
// })

exports.updateMe=catchAsync(async(req,res,next)=>{
    
    //create error if user post password data
   
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates,please use updateMypassword',400));
    }

    //update a user document
  const filteredBody=filterObj(req.body,'name','email');
  

  //it filters the req body as the user is only allowed to change email and name not other things like role password etc
 if(req.file) filteredBody.photo=req.file.filename
  const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
   runValidators:true

})


    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })
})

// exports.getUser=(req,res)=>{
//     res.status(500).json({
//         status:'error',
//         message:'This route is not yet defined'
//     })
// }

exports.deleteMe=catchAsync(async(req,res,next)=>{
    
  await User.findByIdAndUpdate(req.user.id,{
    active:false
  })
  res.status(204).json({
    status:'succccess',
    data:"deleted"
  })

   
})

exports.createUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not defined,plz use signup instead'
    })
}
//get user information based on the user that is currently logged in
exports.getMe= (req,res,next)=>{
    req.params.id=req.user.id;
    next();
}

//do not update passwords with this
exports.getAllUser=factory.getAll(User);
exports.updateUser=factory.updateOne(User)
exports.getUser=factory.getOne(User);
exports.deleteUser=factory.deleteOne(User);