import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import LoginSocMed from '../LoginSocMed/LoginSocMed.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import ConfirmEmail from '../Registration/RegistrationConfirm.js';
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import axios from "axios";
import { EDIT_USER_ENDPOINT } from '../../API/apiConstant';
import useUpdatePasswordEmail from '../../API/User/useUpdatePasswordEmail.js';


const LoginForgotPassword = ({ setForgotPass }) => {
  const [user, setUser] = useState({
    email: '',
    password: ''
  });
  const [emailSet, setEmailSet] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const { validationErrors, validateForm } = useRegistrationValidation();
  const [updatePassword, isLoading, error] = useUpdatePasswordEmail();

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

  const onPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(user)) return;

    await updatePassword(user.email, user.password);

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

  const onEmailConfirmed = () => {
    setEmailConfirmed(true);
    setEmailSet(false);
  }

  return (
    <div>
      {!emailSet ? (
        <><h2>Вхід</h2>

          <div className={classes.containerMain}>
            <LoginSocMed />
            <div className={classes.contBlock}>або</div>

            <div className={classes.container}>
              <form onSubmit={user.password === '' ? onEmailSubmit : onPasswordSubmit} className={classes.form}>
                {emailConfirmed ? (
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

                <div style={{ justifyContent: 'flex-end', display: 'flex', flexDirection:'row', gap: '1vw' }}>
                  <div className="btn btn-light" style={{whiteSpace: 'nowrap'}} onClick={() => setForgotPass(false)}>Згадав пароль</div>
                  <Button>Створити новий пароль</Button>
                </div>
              </form>
            </div>
          </div> </>) :
        <ConfirmEmail
          user={user}
          setEmailSent={setEmailConfirmed}
          setEmailSet={setEmailSet}
          isLogin={true}
          setModalVisible={() => { }}
          setModalLogVisible={() => { }}
          onEmailConfirmed={onEmailConfirmed}
        />
      }
    </div>
  );
};

export default LoginForgotPassword;