



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

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    phone: "",
    country: "",
    region: "",
    city: "",
    postcode: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const { validationErrors, validateForm } = useRegistrationValidation();

  const handleFirstNameChange = (e) => {
    setFormData((prevData) => ({ ...prevData, firstName: e.target.value }));
  };

  const handleLastNameChange = (e) => {
    setFormData((prevData) => ({ ...prevData, lastName: e.target.value }));
  };

  const handleLoginChange = (e) => {
    setFormData((prevData) => ({ ...prevData, login: e.target.value }));
  };

  const handleEmailChange = (e) => {
    setFormData((prevData) => ({ ...prevData, email: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    setFormData((prevData) => ({ ...prevData, phone: e.target.value }));
  };

  const handleCountryChange = (e) => {
    if (e === "Russian Federation") {

      alert("fuck you");
      window.location.replace('https://prytulafoundation.org/');
    } else {
      setFormData((prevData) => ({ ...prevData, country: e }));

    }
  };

  const handleRegionChange = (e) => {
    setFormData((prevData) => ({ ...prevData, region: e }));
  };

  const handleCityChange = (e) => {
    setFormData((prevData) => ({ ...prevData, city: e.target.value }));
  };

  const handlePostcodeChange = (e) => {
    setFormData((prevData) => ({ ...prevData, postcode: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setFormData((prevData) => ({ ...prevData, password: e.target.value }));
    if (formData.confirmPassword && e.target.value !== formData.confirmPassword)
      setPasswordMatchError(true);
    else setPasswordMatchError(false);
  };

  const handleConfirmPasswordChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      confirmPassword: e.target.value,
    }));
    if (formData.password !== e.target.value) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (e.target["diplo"].checked) {
      const isValid = validateForm(formData);

      if (isValid) {
        const hash = bcrypt.hashSync(formData.password);
        const user = formData;
        user.password = hash;

        axios.post("https://localhost:7074/api/auth/register", user).then((result) => {
          console.log('Registration successful:', result.data);
        }).catch((err) => {
          console.error('Registration failed:', err);
        });;

      }
    } else {
      alert("NO DIPLODOCS ALLOWED")
    }
  };

  return (
    <div>
      <h2>Registration</h2>
      <div>
        {validationErrors.firstName && (
          <p className="error">{validationErrors.firstName}</p>
        )}

        {validationErrors.lastName && (
          <p className="error">{validationErrors.lastName}</p>
        )}

        {validationErrors.password && (
          <p className="error">{validationErrors.password}</p>
        )}
        {validationErrors.city && (
          <p className="error">{validationErrors.city}</p>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <label className={classes.label} htmlFor="firstName">
          First Name:
        </label>
        <Input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleFirstNameChange}
          required
        />

        <label className={classes.label} htmlFor="lastName">
          Last Name:
        </label>
        <Input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleLastNameChange}
          required
        />

        <label className={classes.label} htmlFor="login">
          Login:
        </label>
        <Input
          type="text"
          id="login"
          name="login"
          value={formData.login}
          onChange={handleLoginChange}
          required
        />

        <label className={classes.label} htmlFor="email">
          Email:
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleEmailChange}
          required
        />

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

        <label className={classes.label} htmlFor="country">
          Country:
        </label>
        <CountryDropdown
          //blacklist={['RU']}
          value={formData.country}
          onChange={handleCountryChange} />
        <br />
        {formData.country === "" ? <></> : <>
          <label className={classes.label} htmlFor="region">
            Region:
          </label>
          <RegionDropdown
            country={formData.country}
            value={formData.region}
            onChange={handleRegionChange} />
        </>}


        <br />
        {formData.region === "" ? <></> : <>
          <label className={classes.label} htmlFor="city">
            City:
          </label>
          <Input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleCityChange}
          />
        </>
        }


        <label className={classes.label} htmlFor="postcode">
          Postcode:
        </label>
        <Input
          type="text"
          id="postcode"
          name="postcode"
          value={formData.postcode}
          onChange={handlePostcodeChange}
        />

        <label className={classes.label} htmlFor="password">
          Password:
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
        />

        <label className={classes.label} htmlFor="confirmPassword">
          Confirm Password:
        </label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />

        {passwordMatchError && (
          <p style={{ color: "red" }}>Passwords do not match.</p>
        )}
        <p>I am not a diplodocus <input name="diplo" type="checkbox" /></p>
        <Button type="submit" disabled={passwordMatchError}>

          Register
        </Button>
      </form>
    </div>
  );
};

export default Registration;
