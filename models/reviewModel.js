const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Tour = require('./../models/tourModel');

const reviewShcema = new mongoose.Schema(
  {
    review: {
      type: String,
      required:[true,"Cannot be empty"]
    },
    rating: {
      type: Number,
      min:1,
      max:5
    },
    createdAt: {
      type: Date,
      default:Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required:[true,"Review must belong to a tour"]

    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"Review must belong to a user"]
       }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  });

reviewShcema.index({tour:1,user:1},{unique:true})

  reviewShcema.pre(/^find/,function(next){
    this.populate({
      path:'user',
      select:'name role photo'  
     })
    // .populate({
    //   path:'tour',  
    //   select:'name'  
    //  })
    next()
  })
 
 reviewShcema.statics.calcAverageRatings=async function(tourId){
//in static  methds this points to the current mondel
 
const stats= await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ])
  

if(stats.length>0){
  await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity:stats[0].nRating,
    ratingsAverage:stats[0].avgRating
  })
}else{
  await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity:0,
    ratingsAverage:4.5
  })
}

 } 
 reviewShcema.post('save',function(){
  //this points to document while contructor is the model who created that document
   this.constructor.calcAverageRatings(this.tour)
   
 }) 

 reviewShcema.pre(/^findOneAnd/,async function(next){
  //executing the query
  this.r= await this.findOne()
 next()
 })

reviewShcema.post(/^findOneAnd/,async function(){

 await this.r.constructor.calcAverageRatings(this.r.tour);
  })
 

const Review=mongoose.model("Review",reviewShcema)
module.exports=Review