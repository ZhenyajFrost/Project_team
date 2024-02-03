import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import LoginSocMed from '../LoginSocMed/LoginSocMed.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import bcrypt from 'bcryptjs'
import axios from 'axios'

const LoginForgotPassword = ({ setForgotPass }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const inpRef = useRef();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // axios.post("https://localhost:7074/api/auth/login", {
    //   email: user.email,
    //   password: user.password
    // }).then((result) => {
    //   console.log('Login successful:', result.data);
    // }).catch((err) => {
    //   console.error('Login failed:', err);
    // });;
    setEmail("");
  };

  return (
    <div>
      <h2>Вхід</h2>
      <div className={classes.container}>
        <div className={classes.container}>
          <form onSubmit={onSubmit}>
            <div className={classes.containerVer}>
              <label className={classes.label} htmlFor="email">
                Email:
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Введіть email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <div style={{ textAlign: 'end' }}>
              <div className="btn btn-light" onClick={() => setForgotPass(false)}>Згадав пароль</div>
              <Button>Створити новий пароль</Button>
            </div>
          </form>
        </div>

        <div className={classes.contBlock}>або</div>

        <LoginSocMed />
      </div>
    </div>
  );
};

export default LoginForgotPassword;