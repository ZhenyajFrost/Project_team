import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import LoginSocMed from '../LoginSocMed/LoginSocMed.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import ConfirmEmail from '../Registration/RegistrationConfirm.js';
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import axios from "axios";

const LoginForgotPassword = ({ setForgotPass }) => {
  const [user, setUser] = useState({
    email: '',
    password: ''
  });
  const [emailSet, setEmailSet] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { validationErrors, validateForm } = useRegistrationValidation();

  const resetEmailSet = () => {
    setEmailSet(false);
  };

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

    axios.post("https://localhost:7074/api/auth/update-password", {
      email: user.email,
      password: user.password
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

  return (
    <div>
      <h2>Вхід</h2>
      {!emailSet ? (
        <div className={classes.container}>
          <div className={classes.container}>
            <form onSubmit={user.password === '' ? onEmailSubmit : onPasswordSubmit}>
              {!emailSent ? (
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
                </div>) : (
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
          setEmailSent={setEmailSent}
          isLogin={true}
          setModalVisible={() => {/* logic here */ }}
          setModalLogVisible={() => {/* logic here */ }}
          onEmailConfirmed={resetEmailSet}
        />
      }
    </div>
  );
};

export default LoginForgotPassword;