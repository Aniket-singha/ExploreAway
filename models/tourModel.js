const mongoose = require('mongoose');
const slugify = require('slugify');
const validator=require('validator');
const User=require('./userModel')
const tourShcema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      maxlength:[39,'A tour name must have at most 39 characters'],
      minlength:[10,'A tour name must have at least 10 characters'],
      // validate:[validator.isAlpha,'TOur name must have only character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //built in mongoose validator
      enum:{
       values: ["easy","medium",'difficult'],
       message:'DIfficulty is either easy ,medium or difficult'
    }
  }
    ,
    ratingsAverage: {
      type: Number,
      default: 3.5,
      min:[1,"Rating must be above 1"],
      max:[5,"Rating must be below 5"],
      //this callback runs whenever a new value is set yo ratingsAverage 
      set:val=>Math.round(val*10)/10

    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      //Custom validator
      validatte:{
       validator: function(val){
        //this points to the document only when we are crating a new document
        //wont work for update
       //works for save and create
        return val<this.price;
      },
      message:"Discount should be less than price"
    }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'a tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      // required:[true, 'A tour must have description' ]
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have image'],
    },
    images: {
      type: [String],
      // required:[true, 'A tour must have image full' ]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation:{
      //geojson
      type:{
           type:String,
           default:'Point',
           enum:['Point']
      },
      coordinates:[Number],
      address:String,
      description:String
    },
    locations:[
      {
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates: [Number],
        address : String,
        description: String,
        day: Number
      }
    ],

    // guides: Array
    guides:[
      {
       type:mongoose.Schema.ObjectId,
       ref:'User'   
      }
    ]

  },

  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
//sorting the price index in increaing oreder if there is 1
tourShcema.index({price:1,ratingsAverage:-1})
tourShcema.index({slug:1})
tourShcema.index({startLocation:'2dsphere'})


tourShcema.virtual('durationWeeks').get(function () {
  //this points to a document
  return this.duration / 7;
});
//virtual populate
tourShcema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})
//DOcumnet middleware it runs before the save() and .create()
tourShcema.pre('save', function (next) {
  //this points to the document
  this.slug = slugify(this.name, { lower: true });
  next();
  //   console.log(this)
  // how the document loooks before getting saved in the database
});
tourShcema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:"-__v -passwordChangedAt"
     
   })
  next()
})

// tourShcema.pre('save',async function(next){
//  const guidesPromises= this.guides.map(async function(id){
//    return await User.findById(id)
//  })
//  this.guides=await Promise.all(guidesPromises);
//  next();
// })

//it runs after the document is saved into the db
tourShcema.post('save', function (doc, next) {
  //doc is the document that has just been saved
  next();
});
// tourShcema.pre('find',function(next){
//     this.find({secretTour:{$ne:true}}); 
//     next();
// })
// tourShcema.pre('findOne',function(next){
//     this.find({secretTour:{$ne:true}}); 
//     next();
// })
tourShcema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}}); 
    this.start=Date.now();
    next();
})
tourShcema.post(/^find/,function(doc,next){
    // console.log(`query took ${Date.now()-this.start} millisecond `)
    next()
})


// tourShcema.pre('aggregate',function(next){
//     this.pipeline().unshift({
//         $match:{secretTour: {$ne:true}}
//     })
//     next();
// })



const Tour = mongoose.model('Tour', tourShcema);
module.exports = Tour;
