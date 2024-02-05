const Tour= require('../models/tourModel')
const User= require('../models/userModel')
const Booking = require('./../models/bookingModel');


const catchAsync= require('../utils/catchAsync')
const AppError=require('../utils/appError')
exports.getOverview=catchAsync(async(req,res,next)=>{

    //get all tour data from the collection
    const tours=await Tour.find();
    

    //build the template

    //render that template using the tour data from step 1
 


    res.status(200).render('overview',{
        title: 'All Tours',
        tours:tours,
    })
})

exports.getTour=catchAsync(async(req,res,next)=>{
console.log(req.user);
console.log(res.locals)
const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields: 'review rating user'
})

if(!tour){
    return next(new AppError('There is no tour with that name'))
}

// tour.reviews.forEach(el=>{
//     console.log(el.user.photo,el.user.name);
// })
    res.status(200).render('tour',{
        title: `${tour.name} Tour`,
        tour
    }) 
})

// exports.checker=catchAsync(async(req,res,next)=>{
//     if(!req.user) return next();
//     const currTour=await Tour.find({slug:req.params.slug})
//     console.log('lulu')
//     console.log(currTour)
//     const bookings=await Booking.find({user:req.user.id});
//     // console.log(bookings)
//     const isitBooked= bookings.find((el)=>{
//         return el.tour===currTour._id
//     })
//     console.log('start')
//     console.log(isitBooked)
//     console.log('end')
//     if(!isitBooked) return next();

//     res.locals.itsBooked=true;
//     next();
// })

exports.getLoginForm=async(req,res)=>{

    res.status(200).set(
        'Content-Security-Policy',
        "connect-src 'self' http://127.0.0.1:3000/"
    ).render('login',{
        title: `Login page`,
    }) 

}

exports.getSignupForm=async(req,res)=>{
    res.status(200).render('signup')
}

exports.getAccount=(req,res)=>{
    res.status(200).render('account',{
        title: `Your account`
    })
}



exports.updateUserData=catchAsync(async(req,res,next)=>{
  const updatedUser=await User.findByIdAndUpdate(req.user.id,{
    name:req.body.name,
    email:req.body.email
  },{
    new:true,
    runValidators:true
  })
    
    res.status(200).render('account',{
        title: `Your account`,
        user:updatedUser
    })
})

exports.getMyTours=catchAsync(async(req,res,next)=>{
//find all bookings of the currently logged in user
const bookings= await Booking.find({user:req.user.id})

//find tours with the returned IDs
const tourIDs=bookings.map(el=>{
    return el.tour
})
const tours=await Tour.find({_id: {$in : tourIDs}})

res.status(200).render('overview',{
    title:'My tours',
    tours
})


})