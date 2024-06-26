import axios from 'axios'
import { showAlert } from './alerts'
//type is either password or data
export const updateSettings=async (data,type)=>{
try{
    const url=type==='password'?'/api/v1/users/updatemyPassword':'/api/v1/users/updateMe'
    const res=await axios({
        method:'PATCH',
        url:  url, 
        data
    })

    if(res.data.status==='success'){
        showAlert('success',`${type.toUpperCase()} UPDATED SUCCESSFULLY`)
        window.setTimeout(()=>{
            location.assign('/me')
        },1500)
    }
}catch(err){
  showAlert('error',err.response.data.message)
}
} 