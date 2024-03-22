import React, { useEffect } from 'react';
import classes from './LoginSocMed.module.css';
import google from './images/google.svg';
import axios from 'axios';
import Notiflix from 'notiflix';
import { setLocalStorage } from '../../utils/localStorage';
import { AUTH_ENDPOINT, GOOGLE_CLIENT_ID } from '../../API/apiConstant';
import { GoogleLogin } from 'react-google-login';
import { gapi } from 'gapi-script';

const LoginSocMed = () => {
  // Success handler for both login and logout

  const onSuccess = (response) => {
    if (response.profileObj) { // Login success
      console.log(response);
      const user = {
        ...response.profileObj,
        name: undefined, // remove googleId if you don't want to send it to the backend
      };

      const isUserLoggedIn = localStorage.getItem('isLoggined') === 'true';

      if (isUserLoggedIn)
        return;

      axios.post(`${AUTH_ENDPOINT}/register/google`, user)
        .then((result) => {
          const userData = {
            ...result.data.user,
            notifications: {
              ...result.data.notifications,
            },
            likedLotIds: result.data.likedLotIds ? result.data.likedLotIds : [],
            likedUsers: result.data.subscribedUserIds,
          };

          setLocalStorage('user', userData);
          setLocalStorage('token', result.data.token);
          setLocalStorage('webSocketToken', result.data.webSocketToken)
          setLocalStorage('isLoggined', true);

          Notiflix.Notify.success("Вхід успішний!");
          setTimeout(() => window.location.reload(), 3000);

        }).catch((err) => {
          Notiflix.Notify.failure('Вхід з помилками! Тикніть для інформації', () => {
            Notiflix.Notify.info(`${err.response?.data.message || 'An error occurred'}`);
          });
        });

    } else {
      console.log("Logout successful");
    }
  };

  const onFailure = (res) => {
    console.log("Login failure", res);
  };

  return (
    <div className={classes.container}>
      <label>Увійти за допомогою</label>
      <GoogleLogin
        clientId={GOOGLE_CLIENT_ID}
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={false}
        render={renderProps => (
          <div onClick={renderProps.onClick} disabled={renderProps.disabled} className={classes.btn}>
            <img src={google} alt="Google sign-in" /> Login with Google
          </div>
        )}
      />
    </div>
  );
};

export default LoginSocMed;