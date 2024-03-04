import React, { useRef, useState } from 'react';
import classes from './LoginSocMed.module.css';
import google from './images/google.svg';
import facebook from './images/facebook.svg';
import apple from './images/apple.svg';


const LoginSocMed = () => {

  return (
        <div className={classes.container}>
          <label>Увійти за допомогою</label>
          <div className={classes.btn}><img src={google}/> Google</div>
          <div className={classes.btn}><img src={facebook}/> Facebook</div>
          <div className={classes.btn}><img src={apple}/> Apple</div>
        </div>
  );
};

export default LoginSocMed;