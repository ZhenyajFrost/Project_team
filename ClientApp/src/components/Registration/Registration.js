import React, { useState } from "react";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.jsx";
import classes from "../../styles/LoginAndRegistration.module.css";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    phone: "",
    country: "",
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
    setFormData((prevData) => ({ ...prevData, country: e.target.value }));
  };

  const handleCityChange = (e) => {
    setFormData((prevData) => ({ ...prevData, city: e.target.value }));
  };

  const handlePostcodeChange = (e) => {
    setFormData((prevData) => ({ ...prevData, ostcode: e.target.value }));
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
    // Add your registration logic here
    // For simplicity, let's just log the input values
    e.preventDefault();

    const isValid = validateForm(formData);

    if (isValid) {
      const hash = bcrypt.hashSync(formData.password);

      const token = nanoid();
      const user = formData;
      user.password = hash;
      user.token = token;

      console.log(user);
    }
  };

  return (
    <div>
      <h2>Registration</h2>
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
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
        />

        <label className={classes.label} htmlFor="country">
          Country:
        </label>
        <Input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleCountryChange}
        />

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

        <Button type="submit" disabled={passwordMatchError}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default Registration;
