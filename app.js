const express=require('express');
const morgan=require('morgan');
const globalErrorHandler=require('./Controllers/errorController.js')
const AppError=require('./utils/appError.js')
const tourRouter=require('./routes/tourRoutes.js');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const viewRouter=require('./routes/viewRoutes');
const bookingRouter=require('./routes/bookingRoutes');
const cookieParser=require('cookie-parser')
const path=require('path')
const rateLimit= require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize= require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp');
const app=express();
// if(process.env.NODE_ENV==='development'){
//     app.use(morgan('dev'));

//a }

  
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))

// app.use(helmet())


const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    //it means at max 100 requests from the ame IP in one hour
    message:'Too many request from this IP,plz try again in an hour'
})
//affects all routes that starts with api
app.use('/api',limiter)
//whenver body has data greater than 10kb it wont be accepted
app.use(express.json({ limit:'10kb'}));
app.use(mongoSanitize()) // removes dollar sign if we use query in req.body
app.use(xss());// converts html that attackers pass into req.body into string

app.use(hpp({
    whitelist: ['duration','ratingsquantity','ratingsAverage','difficulty','price']
})) //prevent parameter pollution
//if we use sort twice in querystring with diff fields by default express create as array of string from those fields which we wont be able to spli in apifeatures
// and converts it into using only the last field
app.use(express.static(path.join(__dirname,'public')))

app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())
console.log(process.env.NODE_ENV);
console.log(typeof(process.env.NODE_ENV));

app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
  
    next();
})

app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);



app.all('*',(req,res,next)=>{
//     res.status(404).json({
//         status:'fail', 
//         message:`Cant find on this server`
// })
// const err=new Error('Cant find on this server')
// err.status='fail';
// err.statusCode=404;
//if next gets an argument it will skip all hte middlewares in the between and directly execute the error handlin minddleware
// next(err)
next(new AppError('Cant find this route',404));
})
app.use(globalErrorHandler);
module.exports=app;