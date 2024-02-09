import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import LoginSocMed from '../LoginSocMed/LoginSocMed.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import ConfirmEmail from '../Registration/RegistrationConfirm.js';
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import axios from "axios";
import { EDIT_USER_ENDPOINT } from '../../API/apiConstant';


const LoginForgotPassword = ({ setForgotPass }) => {
  const [user, setUser] = useState({
    email: '',
    password: ''
  });
  const [emailSet, setEmailSet] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const { validationErrors, validateForm } = useRegistrationValidation();

  const handleEmailChange = (e) => {
    setUser((prev) => ({
      ...prev,
      email: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setUser((prev) => ({
      ...prev,
      password: e.target.value
    }));
  };

  const onPasswordSubmit = (e) => {
    e.preventDefault();

    if(!validateForm(user)) return;

    axios.post(`${EDIT_USER_ENDPOINT}/update-password`, {
        email: user.email,
        newPassword: user.password
      }).then((result) => {
      console.log('Updated successfuly:', result.data);
    }).catch((err) => {
      console.error('Failed to update:', err);
    });;

    setForgotPass(false);
    setUser({
      email: '',
      password: ''
    });
  }

  const onEmailSubmit = (e) => {
    e.preventDefault();
    setEmailSet(true);
  };

  const onEmailConfirmed = () =>{
    setEmailConfirmed(true);
    setEmailSet(false);
  }

  return (
    <div>
      <h2>Вхід</h2>
      {!emailSet? (
        <div className={classes.container}>
          <div className={classes.container}>
            <form onSubmit={user.password === '' ? onEmailSubmit : onPasswordSubmit}>
              {emailConfirmed ?  (
                <div className={classes.containerVer}>
                  <label className={classes.label} htmlFor="email">
                    Set Password:
                  </label>
                  {validationErrors.password && (
                    <p className="error">{validationErrors.password}</p>
                  )}
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Введіть password"
                    value={user.password}
                    onChange={handlePasswordChange}
                    required />
                </div>) :
                (
                  <div className={classes.containerVer}>
                    <label className={classes.label} htmlFor="email">
                      Email:
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Введіть email"
                      value={user.email}
                      onChange={handleEmailChange}
                      required />
                  </div>) 
              }

              <div style={{ textAlign: 'end' }}>
                <div className="btn btn-light" onClick={() => setForgotPass(false)}>Згадав пароль</div>
                <Button>Створити новий пароль</Button>
              </div>
            </form>
          </div>

          <div className={classes.contBlock}>або</div>

          <LoginSocMed />
        </div>) :
        <ConfirmEmail
          user={user}
          setEmailSent={setEmailConfirmed}
          setEmailSet={setEmailSet}
          isLogin={true}
          setModalVisible={() => {}}
          setModalLogVisible={() => {}}
          onEmailConfirmed={onEmailConfirmed}
        />
      }
    </div>
  );
};

export default LoginForgotPassword;