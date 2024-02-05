const mongoose=require('mongoose');
const bookingSchema=new mongoose.Schema({
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Booking must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Booking must belong to a user']

    },
    price:{
        type:Number,
        require:[true,'Booking musr have a price']
    },
    createdAt:{
        type:Date,
        dafault:Date.now()
    },
    paid:{
        type:Boolean,
        dafault:true
    }

})
bookingSchema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })
    next();
})
const Booking=mongoose.model('Booking',bookingSchema)
module.exports=Booking