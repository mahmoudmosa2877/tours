// const stripe = Stripe(
//   'pk_test_51M04MwHB5tOBqbBImB4SzfJXnodOUzwVR5Z9jNvi5LXffwppJJvxm67RQcwoZPwmPeFgRfFWFWH4bQx0jVjHQKW000ndOPUAEL'
// );
import axios from 'axios';

const stripe = Stripe(
  'pk_test_51M04MwHB5tOBqbBImB4SzfJXnodOUzwVR5Z9jNvi5LXffwppJJvxm67RQcwoZPwmPeFgRfFWFWH4bQx0jVjHQKW000ndOPUAEL'
);

export const bookTour = async tourId => {
  //1) get the session from the server from api
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-sessions/${tourId}`
    );
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

    console.log(session);
  } catch (err) {
    console.log(err);
  }

  //2)use strip method to creste checkout form + chare credit card
};
