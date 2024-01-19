import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.js'
import classes from '../../styles/LoginAndRegistration.module.css'
import bcrypt from 'bcryptjs'
import axios from 'axios'
 
const Login = () => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const inpRef = useRef();
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
 
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleLoginChange = (e) => {
    setLogin(e.target.value);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const hash = bcrypt.hashSync(password);
    const user = {login, email, password:hash };

    axios.post("https://localhost:7074/api/auth/login", {
      login: user.login,
      email: user.email,
      password: user.password
    }).then((result) => {
      console.log('Login successful:', result.data);
    }).catch((err) => {
      console.error('Login failed:', err);
    });;

    setEmail("");
    setPassword("");
  };
 
  return (
<div>
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
</div>
  );
};
 
export default Login;