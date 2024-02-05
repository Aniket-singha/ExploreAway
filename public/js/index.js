import {login,logout,signup} from './login'
import '@babel/polyfill'
import { updateSettings} from './updateSettings'
import { bookTour } from './stripe'
const loginForm=document.querySelector('.form--login')
const logoutBtn=document.querySelector('.nav__el--logout')
const userPasswordForm=document.querySelector('.form-user-password')
const userDataForm=document.querySelector('.form-user-data')
const bookBtn=document.getElementById('book-tour');
const signupForm=document.querySelector('.form--signup')
if(loginForm){
loginForm.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('email').value
    const password=document.getElementById('password').value
    login(email,password)
})

}
if(signupForm){
    signupForm.addEventListener('submit',e=>{
        e.preventDefault();
    const username=document.getElementById('username').value
    const email=document.getElementById('email').value
    const password=document.getElementById('password').value
    const passwordConfirm=document.getElementById('passwordConfirm').value
    signup(username,email,password,passwordConfirm);


    })
}
if(logoutBtn)logoutBtn.addEventListener('click',logout)
if(userDataForm){
    userDataForm.addEventListener('submit',e=>{
     e.preventDefault()
     

     const form=new FormData()
     form.append('name',document.getElementById('name').value)
     form.append('email',document.getElementById('email').value)
     form.append('photo',document.getElementById('photo').files[0])
    //  console.log(form)

// const name=document.getElementById('name').value;
// const email=document.getElementById('email').value;
updateSettings(form,'data')

    })
}

if(userPasswordForm){
    userPasswordForm.addEventListener('submit',e=>{
     e.preventDefault()
     

    //  const form=new FormData()
    //  form.append('name',document.getElementById('name').value)
    //  form.append('email',document.getElementById('email').value)
    //  form.append('photo',document.getElementById('photo').files[0])
    //  console.log(form)

const passwordCurrent=document.getElementById('password-current').value;
const password=document.getElementById('password').value;
const passwordConfirm=document.getElementById('password-confirm').value;

updateSettings({passwordCurrent,password,passwordConfirm},'password')

    })
}

if(bookBtn){
    bookBtn.addEventListener('click',e=>{
       e.target.textContent='Processing...'
        const tourId=e.target.dataset.tourId
        bookTour(tourId);
    })
}