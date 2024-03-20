import React, { useEffect, useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import LoginSocMed from '../LoginSocMed/LoginSocMed.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import { setLocalStorage } from '../../utils/localStorage.js';
import axios from 'axios'
import { AUTH_ENDPOINT } from '../../API/apiConstant.js'
import Notiflix from 'notiflix';
import Userstore from '../../utils/Zustand/Userstore.js';


const Login = ({setModalVisible, setModalRegVisible, setForgotPass, setIsLoggined1}) => {
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const {setUser, setToken, setIsLoggined} = Userstore();
  const handleEmailChange = (e) => {
    setLoginVal(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const onRegClick = () => {
    setModalVisible(false);
    setModalRegVisible(true);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    var email;
    var login;

    if(loginVal.includes('@')){
      email = loginVal;
      login = "";
    }else{
      email = "";
      login = loginVal
    }

    const user = {login: login ,email: email, password: password };
    axios.post(`${AUTH_ENDPOINT}/login`, {
      login: user.login,
      email: user.email,
      password: user.password
    }).then(async (result) => {

      const user = {
        ...result.data.user,
        notifications: {
          ...result.data.notifications,
        },
        likedLotIds: result.data.likedLotIds,
        likedUsers: result.data.subscribedUserIds,
      }
      setUser(user);
      setIsLoggined(true);
      setToken( result.data.token);

      setLocalStorage('user',user);
      setLocalStorage('token', result.data.token);
      setLocalStorage('isLoggined', true);
      setIsLoggined1(true);

      //window.location.reload();

    }).catch((err) => {
      Notiflix.Notify.failure(`Вхід з помилками! Тикніть для інформації`, () => {
        Notiflix.Notify.info(`${err.response.data.message}`);
    })
    });;

    setModalVisible(false);
    setLoginVal("");
    setPassword("");
  };

  return (
    <div>
      <h2>Login</h2>
      <div className={classes.container}>
        <div className={classes.container}>
          <form onSubmit={onSubmit} className={classes.form}>
            <div className={classes.containerVer}>
              <div className={classes.containerVer}>
                <label className={classes.label} htmlFor="email">
                  Пошта або логін:
                </label>
                <Input
                  type="value"
                  id="value"
                  name="loginVal"
                  placeholder="Введіть email aбо login"
                  value={loginVal}
                  onChange={handleEmailChange}
                  required
                />
              </div>

              <div className={classes.containerVer}>
                <label className={classes.label} htmlFor="password">
                  Пароль:
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className={classes.text} onClick={() => setForgotPass(true)}>Забув пароль</div>
            </div>

            <div style={{ textAlign: 'end' }}>
              <div className="btn btn-light" onClick={onRegClick}>Зареєструватися</div>
              <Button>Увійти</Button>
            </div>
          </form>
        </div>

        <div className={classes.contBlock}>або</div>

        <LoginSocMed/>
      </div>
    </div>
  );
};

export default Login;

{/* <div>
<h2>Login</h2>
<form onSubmit={onSubmit}>
<label className={classes.label} htmlFor="email">Login:</label>
<Input
          type="text"
          id="login"
          name="login"
          value={login}
          onChange={handleLoginChange}
          required
        />
<label className={classes.label} htmlFor="email">Email:</label>
<Input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleEmailChange}
          required
        />
 
        <label className={classes.label} htmlFor="password">Password:</label>
<Input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          ref={inpRef}
          required
        />
<Button type="button" onClick={()=>{
    if(inpRef.current.type==="password"){
      inpRef.current.type = "text";
    }else{
      inpRef.current.type="password"
    }
  }}>
  👁
</Button>
<Button>
          Login
</Button>
</form>
</div> */}