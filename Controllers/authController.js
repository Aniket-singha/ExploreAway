const jwt=require('jsonwebtoken');
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {promisify}=require('util');
const crypto=require('crypto')
const signToken= id=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
      })
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions={
       
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
           httpOnly:true
        
        }
    if(process.env.NODE_ENV==='production') cookieOptions.secure=true;
        res.cookie('jwt',token,cookieOptions)

        user.password=undefined;
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

exports.signup=catchAsync(async(req,res,next)=>{
    // const newUser= await User.create(req.body);
    const newUser=await User.create(req.body)
   const url=`${req.protocol}://${req.get('host')}/me`;
   await new Email(newUser,url).sendWelcome();
    createSendToken(newUser,201,res);
})

exports.login=catchAsync(async (req,res,next)=>{
    // const email=req.body.email;
    // const password=req.body.password;
    const {email,password}=req.body;

    // check if email and password exist
    if(!email|| !password){
        return next(new AppError('PLz provide email and password',400))
    }
    //check if user already exists and password is correct
    const user=await User.findOne({email:email}).select('+password')
    // console.log(user)
    
     if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401));
     }
    //if everything ok,send token to client
    createSendToken(user,200,res);

})

exports.logout=(req,res)=>{
  res.cookie('jwt','loggedout',{
    expires: new Date(Date.now()+ 10*1000),
    httpOnly:true
  })
  res.status(200).json({status:'success'})
}

exports.protect=catchAsync(async(req,res,next)=>{
   //getting token and check if it exists
  //  console.log('g');
   let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        // console.log('d') 
         token=req.headers.authorization.split(' ')[1];
        
    }
    else if(req.cookies.jwt){
      token=req.cookies.jwt
    }    
        //  console.log(token)
         if(!token){
            return next(new AppError('You are not logged in,plz login to get access',401))
         }

   //Verification token
 const decoded =await promisify(jwt.verify)(token,process.env.JWT_SECRET);
 //reoslved value will be the decoded value of payload ie. token jiss user se ana h uski id
//  console.log(decoded);
 //check if user still exists
 const freshUser=await User.findById(decoded.id)
 if(!freshUser){
    return next(new AppError("the token belonging to this user does no loner exists",401))

 }

   //check if user changed passwords after jwt was issued
  if(freshUser.changePasswordsAfter(decoded.iat)){
    return next(new AppError("User recently changed password please log in again",401))
    
  }
  req.user=freshUser;
  res.locals.user=freshUser

  console.log("init")
   next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };
exports.forgotPassword=catchAsync(async(req,res,next)=>{

    // get user baed on posted email

    const user=await User.findOne({email:req.body.email});
    if(!user) return next(new AppError('no user with that email address',404));

    //generate random token
    const resetToken=user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})
    //send it back as email
   
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    // console.log(resetURL)
    const message=`Forgot your password submit a patch req with your new password and passwordConfirm to: ${resetURL}\n If you didnt forget your password,please ignore this email`;
try{
    // await sendEmail({
    //     email:user.email,
    //     subject:'Your password reset token is valid for 10 min',
    //     message:message
    // })
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
        status:'success',
        message:'Token sent to email'
    })
  
}catch(err){
    console.error(err);
    user.passwordResetToken =undefined;
    user.passwordResetExpires=undefined;
    await user.save({validateBeforeSave:false});
    return next(new AppError('There was an error sending the email.Try again',500))
}

})
exports.resetPassword=catchAsync(async(req,res,next)=>{
    //get user based on the token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt: Date.now()}});
    
    //if token has not expired,and there is user,set the  new password
    if(!user){
        return next(new AppError('Token is invalid or has expired',400));

    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
                       
    await user.save();

    //update changedPassword property for the user
    createSendToken(user,200,res);

    //log the user in send jwt
}
)

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
  //  console.log('in updatepass')
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
  
    // 4) Log user in, send JWT
    // console.log("init3")
    createSendToken(user, 200, res);
  });

  exports.isLoggedIn=async(req,res,next)=>{
     if(req.cookies.jwt){
      try{
  const decoded =await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
         
   
  const freshUser=await User.findById(decoded.id)
  if(!freshUser){
     return next()
  }
 
    //check if user changed passwords after jwt was issued
   if(freshUser.changePasswordsAfter(decoded.iat)){
     return next();
   }
  //there is a logged in user
  req.user=freshUser
   res.locals.user=freshUser
   return next();
  }catch(err){
    return next()
  }
  }
  next();

 };
 
