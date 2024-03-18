import { useState } from "react";
 
const useRegistrationValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
 
  const validateText = (name) => {
    const nameRegex = /^[a-zA-Z\u0400-\u04FF]*[-\s]?[a-zA-Z\u0400-\u04FF]*?$/u;
    return nameRegex.test(name);
  };

  const validateLogin = (name) => {
    const nameRegex = /^[a-z0-9_-]*$/;
    return nameRegex.test(name);
  };
 
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
      return passwordRegex.test(password);
  };
 
  const validateForm = (formData) => {
    const errors = {};
 
    if (!validateText(formData.firstName) && formData.firstName) {
      console.log("UseReg: " + validateText(formData.firstName) + " firstName: " + formData.firstName);
      errors.firstName = "First name must only contain letters, space or \"-\"";
    }

    if (!validateLogin(formData.login) && formData.login) {
      console.log("UseReg: " + validateLogin(formData.login) + " firstName: " + formData.firstName);
      errors.login = "Login name must only contain letters, numbers, space,  \"-\" or \"_\"";
    }
 
    if (!validateText(formData.lastName) && formData.lastName) {
      console.log("UseReg: " + validateText(formData.lastName) + " lastName: " + formData.lastName);
      errors.lastName = "Last name must only contain letters, space or \"-\"";
    }
 
    if (!validatePassword(formData.password) && formData.password) {
      console.log("UseReg: " + validatePassword(formData.password) + " password: " + formData.password);
      errors.password =
        "Password must have a minimum of 8 characters, at least one lowercase letter, one uppercase letter, and one special symbol.";
    }
 
    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return { validationErrors, validateForm };
};
 
export default useRegistrationValidation;