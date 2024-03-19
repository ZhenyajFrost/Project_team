import React, { useRef, useState } from 'react';
import classes from './LoginSocMed.module.css';
import google from './images/google.svg';
import axios from 'axios';
import { AUTH_ENDPOINT } from '../../API/apiConstant';
import Notiflix from 'notiflix';

import { gapi } from 'gapi-script'

import { GOOGLE_CLIENT_ID } from '../../API/apiConstant';
import { GoogleLogin, GoogleLogout } from 'react-google-login'
import { useEffect } from 'react';


const LoginSocMed = () => {



  const onSuccess = (res) => {
    console.log(res);
    const {name, ...user} = res.profileObj;

    axios.post(`${AUTH_ENDPOINT}/register/google`, user)
    .then((result) => {

      console.log(result)

    }).catch((err) => {
      Notiflix.Notify.failure(`Вхід з помилками! Тикніть для інформації`, () => {
        Notiflix.Notify.info(`${err.response.data.message}`);
      })
    });;

  }

  const onLogoutSuccess = (res) => {
    console.log("Logout", res)
  }

  const onFailure = (res) => {
    console.log("failure", res)
  }

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: ''
      })
    };
    gapi.load('client:auth2', start)
  });

  return (
    <div className={classes.container}>
      <label>Увійти за допомогою</label>

      <GoogleLogin
        clientId={GOOGLE_CLIENT_ID}
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
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