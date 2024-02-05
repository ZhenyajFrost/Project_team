import React, { useEffect, useState } from "react";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import PhoneInput from "../UI/PhoneInput/PhoneInput.js";
import classes from "../../styles/LoginAndRegistration.module.css";
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import useSendConfirmationEmail from "../../hooks/useSendConfirmationEmail";
import LoginSocMed from "../LoginSocMed/LoginSocMed.js";

function Registration({ user, setModalVisible, setModalLogVisible, setUser, setEmailSent}) {
  const [formData, setFormData] = useState({
    login: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    setFormData(user);
  },[]);

  const { validationErrors, validateForm } = useRegistrationValidation();
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatchError(password !== confirmPassword);
    }
  };

  const onLoginClick = () => {
    setModalVisible(false);
    setModalLogVisible(true);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.target["diplo"].checked) {
      alert("NO DIPLODOCS ALLOWED");
      return;
    }

    if (!validateForm(formData) || passwordMatchError) return;
    const { confirmPassword, ...userFormData } = formData;
    setUser(userFormData);
    setEmailSent(true);
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
}

export default Registration;
