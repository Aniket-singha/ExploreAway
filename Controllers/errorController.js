const AppError=require('./../utils/appError');
const handleCastErrorDB=err=>{
    const mesage=`INvalid ${err.path}: ${err.value}`;
    return new AppError(message,400);
}


const handleDuplicateField=err=>{
    const message=`Duplicate field value,please use anothe value`;
    return new AppError(message,400)
}

const handleJWTError=function(){
    return new AppError('Invalid token plz login again',401)
}
const handleJWTExpiredError=function(){
    return new AppError('Token expired login again',401)
}

const sendErrorDev=(err,req,res)=>{
    if(req.originalUrl.startsWith('/api')){
   return  res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack,
    })
}
console.error('ERROR',err);

   return res.status(err.statusCode).render('error',{
        title:'Something went wrong',
        msg:err.message
    })

}


const sendErrorProd=(err,req,res)=>{
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
         return  res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            });
        } 
       
            console.error('ERROR',err);
         return  res.status(500).json({
                status:'error',
                message:'Something went wrong'
            })
        
    }
        if(err.isOperational){
         return    res.status(err.statusCode).render('error',{
                title:'Something went wrong',
                msg:err.message
            })
        } 
       
            console.error('ERROR',err);
          return  res.status(err.statusCode).render('error',{
                title:'Something went wrong',
                msg:'PLz try again later'
            })
        
    
    
}
module.exports=(err,req,res,next)=>{
    // console.log(err.stack)
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error'
    if(process.env.NODE_ENV==='development'){
       sendErrorDev(err,req,res);
    }
    else if(process.env.NODE_ENV==='production'){
        let error={...err};
        error.message=err.message
      if(error.name==='CastError') error=handleCastErrorDB(error)
      if(error.code==11000) error=handleDuplicateField(error)  
      if(error.name==='JsonWebTokenError') error=handleJWTError();
      if(error.name==='TokenExpiredError') error=handleJWTExpiredError();
      sendErrorProd(error,req,res);
    }  
}