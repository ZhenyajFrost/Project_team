import React, { useState, useEffect } from "react";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import PhoneInput from "../UI/PhoneInput/PhoneInput.js";
import classes from "../../styles/LoginAndRegistration.module.css";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import axios from "axios";
import LoginSocMed from "../LoginSocMed/LoginSocMed.js";

function Registration ({setModalVisible, setModalLogVisible, setUser, setConfirmCode, setEmailSent}) {
  const [formData, setFormData] = useState({
    login: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [confirmPassword, setConfirmPassword] = useState("");
  //const [confirmCode, setConfirmCode] = useState("");

  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const { validationErrors, validateForm } = useRegistrationValidation();

  // const handleFirstNameChange = (e) => {
  //   setFormData((prevData) => ({ ...prevData, firstName: e.target.value }));
  // };

  // const handleLastNameChange = (e) => {
  //   setFormData((prevData) => ({ ...prevData, lastName: e.target.value }));
  // };

  const handleLoginChange = (e) => {
    setFormData((prevData) => ({ ...prevData, login: e.target.value }));
  };

  const handleEmailChange = (e) => {
    setFormData((prevData) => ({ ...prevData, email: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    setFormData((prevData) => ({ ...prevData, phone: e.target.value }));
  };

  // const handleCountryChange = (e) => {
  //   if (e === "Russian Federation") {

  //     alert("fuck you");
  //     window.location.replace('https://prytulafoundation.org/');
  //   } else {
  //     setFormData((prevData) => ({ ...prevData, country: e }));

  //   }
  // };

  // const handleRegionChange = (e) => {
  //   setFormData((prevData) => ({ ...prevData, region: e }));
  // };

  // const handleCityChange = (e) => {
  //   setFormData((prevData) => ({ ...prevData, city: e.target.value }));
  // };

  // const handlePostcodeChange = (e) => {
  //   setFormData((prevData) => ({ ...prevData, postcode: e.target.value }));
  // };

  const handlePasswordChange = (e) => {
    setFormData((prevData) => ({ ...prevData, password: e.target.value }));
    if (confirmPassword && e.target.value !== confirmPassword)
      setPasswordMatchError(true);
    else setPasswordMatchError(false);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (formData.password !== e.target.value) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const onLoginClick = () =>{
    setModalVisible(false);
    setModalLogVisible(true);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (e.target["diplo"].checked) {
      const isValid = validateForm(formData);

      if(isValid){
        const hash = bcrypt.hashSync(formData.password);
        const user = formData;
        user.password = hash;

        setEmailSent(true);
        setUser(user);
 
        axios.post("https://localhost:7074/api/auth/send-confrim-email", {email: user.email}).then(result => {
          console.log('Email successfuly sent:', result.data)
          setConfirmCode(result.data.code);
          setUser(user);

        }).catch((err) => {
          console.error('Email sent failed:', err);
        });;
      }
    } else {
      alert("NO DIPLODOCS ALLOWED")
    }
  };

  return (
    <div>
      <h2>Registration</h2>
      <div className={classes.container}>
        {validationErrors.password && (
          <p className="error">{validationErrors.password}</p>
        )}
        <div className={classes.container}>
          <form onSubmit={onSubmit}>
            <div className={classes.container} style={{flexDirection: 'column', gap: '0.5vw'}}>
              <div>
                <label className={classes.label} htmlFor="login">
                  Login:
                </label>
                <Input
                  type="text"
                  id="login"
                  name="login"
                  placeholder="Придумайте логін"
                  value={formData.login}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div>
                <label className={classes.label} htmlFor="phone">
                  Phone:
                </label>
                <PhoneInput
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>

              <div>
                <label className={classes.label} htmlFor="email">
                  Email:
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Введіть email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  required
                />
              </div>

              <div>
                <label className={classes.label} htmlFor="password">
                  Password:
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Придумайте пароль"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label className={classes.label} htmlFor="confirmPassword">
                  Confirm Password:
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Підтвердіть пароль"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                {passwordMatchError && (
                  <p style={{ color: "red" }}>Passwords do not match.</p>
                )}
              </div>
              <p>I am not a diplodocus <input name="diplo" type="checkbox" /></p>
            </div>

            <div style={{textAlign: 'end'}}>
              <div className="btn btn-light" onClick={onLoginClick}>Увійти в свій акаунт</div>
              <Button disabled={passwordMatchError}>Зареєструватися</Button>
            </div>

          </form>
        </div>

        <div className={classes.contBlock}>або</div>

        <LoginSocMed/>
      </div>
    </div>
  );
};

export default Registration;

      // if (isValid) {
      //   const hash = bcrypt.hashSync(formData.password);
      //   const user = formData;
      //   user.password = hash;

      //   axios.post("https://localhost:7074/api/auth/register", user).then((result) => {
      //     console.log('Registration successful:', result.data);
      //   }).catch((err) => {
      //     console.error('Registration failed:', err);
      //   });;

      // }
