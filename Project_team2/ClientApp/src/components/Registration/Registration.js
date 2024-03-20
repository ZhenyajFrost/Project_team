import React, { useEffect, useState } from "react";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import PhoneInput from "../UI/PhoneInput/PhoneInput.js";
import classes from "../../styles/LoginAndRegistration.module.css";
import useRegistrationValidation from "../../hooks/useRegistrationValidation.js";
import LoginSocMed from "../LoginSocMed/LoginSocMed.js";

function Registration({ user, setModalVisible, setModalLogVisible, setUser, setEmailSent }) {
  const [formData, setFormData] = useState({
    login: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user)
      setFormData(user);
  }, [user]);

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

    if (!validateForm(formData) || passwordMatchError) {
      console.log(validationErrors);
      console.log(passwordMatchError);
      return;
    }

    const { confirmPassword, ...userFormData } = formData;
    setUser(userFormData);
    setEmailSent(true);
  };

  return (
    <div>
      <h2>Реєстрація</h2>
      {validationErrors.length > 0 && (
          <p className={classes.error}>{`${validationErrors}`}</p>
        )}
      <div className={classes.container}>

        <div className={classes.container}>
          <form onSubmit={onSubmit} className={classes.form}>
            <div className={classes.container} style={{ flexDirection: 'column', gap: '0.5vw' }}>
              <div>
                <label className={classes.label} >
                  Логін:
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
                  Телефон:
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
                  Пошта:
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
                  {validationErrors.password && (
                    <p className="error">{validationErrors.password}</p>
                  )}
                  Пароль:
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
                  Підтвердіть пароль:
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
                  <p style={{ color: "red" }}>Паролі не співпадають!</p>
                )}
              </div>
              <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center'}}>Я не діплодок <input name="diplo" type="checkbox" /></div>
            </div>

            <div style={{display: 'flex', flexDirection:'row', gap: '1vw', justifyContent: 'flex-end' }}>
              <div className="btn btn-light" onClick={onLoginClick}>Увійти в свій акаунт</div>
              <Button disabled={passwordMatchError}>Зареєструватися</Button>
            </div>

          </form>
        </div>

        <div className={classes.contBlock}>або</div>

        <LoginSocMed />
      </div>
    </div>
  );
}

export default Registration;
