const dotenv=require("dotenv");
const mongoose=require('mongoose')


// const port=3001;
dotenv.config({path: './config.env'});
const app= require('./app');
const DB=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(con=>{
    // console.log(con.connections);
    // console.log("Db connected");
})

// console.log(process.env.NODE_ENV);

// const testTour=new Tour({
//     name:'The forest hiker',
//     rating:3.7,
//     price:397.2
// })
// testTour.save().then(doc=>{
//     console.log(doc);
// }).catch(err=>{
//     console.log("An error occured",err);
// })


const port=process.env.PORT || 3002;
 
const server=app.listen(port,()=>{ 
    console.log(`app running on ${port}`);
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    //the callback in server.close is called when there are no more further requests pending on the server
    
    server.close(() => {
      process.exit(1);
    });
  });
