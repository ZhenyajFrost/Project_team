import React, { useRef, useState } from 'react';
import Button from '../UI/Button/Button.js'
import Input from '../UI/Input/Input.jsx'
import classes from '../../styles/LoginAndRegistration.module.css'
import bcrypt from 'bcryptjs'
 
 
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const inpRef = useRef();
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
 
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
 
  const onSubmit = (e) => {
    // Add your authentication logic here
    // For simplicity, let's just log the input values
    e.preventDefault();
    const hash = bcrypt.hashSync(password);
    const user = {email, password:hash };
   console.log(user);
    setEmail("");
    setPassword("");
  };
 
  return (
<div>
<h2>Login</h2>
<form onSubmit={onSubmit}>
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