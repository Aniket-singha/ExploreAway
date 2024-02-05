import axios from 'axios'
import { showAlert } from './alerts';

const stripe=Stripe('pk_test_51Of9pXSFTyIMLhg9eamNKIyxjiRmiDDsTzMBRf9fNV5F8LfYN3vjBsNJ8irbrsB7z7UlJ96Gci9RM3Vp5uPanw0f00I6i9fqOx')
export const bookTour=async tourId=>{
    //get checkout session from api
    try{
  const session=await axios(`/api/v1/bookings/checkout-session/${tourId}`)
  // console.log(session)
await stripe.redirectToCheckout({
    sessionId:session.data.session.id
})

    }catch(err){
        console.log(err);
showAlert('error',err);
    }
  // use stripe object to create checkout form + charge credit card for us
}