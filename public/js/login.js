import axios from 'axios';
import { showAlert } from './alerts';
export const login= async(email,password)=>{
    try{
 const res= await axios({
    method:'POST',
    url: '/api/v1/users/login',
    data:{
        email,
        password
    }
   })
   if(res.data.status==='success'){
    showAlert('success','Logged in successfully')
    window.setTimeout(()=>{
        location.assign('/')
    },1500)
   }
  //  conso le.log(res);
}catch(err){
  showAlert('error',err.response.data.message)
}
}

export const signup= async(username,email,password,passwordConfirm)=>{
  try{
const res= await axios({
  method:'POST',
  url: '/api/v1/users/signup',
  data:{
      name:username,
      email,
      password,
      passwordConfirm
  }
 })
 if(res.data.status==='success'){
  showAlert('success','Account created successfully')
  window.setImmediate(()=>{
      location.assign('/')
  },1500)
 }
//  console.log(res);
}catch(err){
showAlert('error',err.response.data.message)
}
}

export const logout=async()=>{
    try{ 
      const res=await axios({
        method:'GET',
        url:'/api/v1/users/logout'
      })
      if(res.data.status='success'){
        if (location.pathname === '/me') {
          location.assign('/');
        } else {
          location.reload(true);
        }
      }
    }catch(err){
        showAlert('error','Error logging out plz try again')
    }
}