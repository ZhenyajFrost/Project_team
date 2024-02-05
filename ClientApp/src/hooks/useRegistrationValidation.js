import { useState } from "react";
 
const useRegistrationValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
 
  const validateText = (name) => {
    const nameRegex = /^[a-zA-Z]*[-\s]?[a-zA-Z]*?$/;
    return nameRegex.test(name);
  };
 
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
      return passwordRegex.test(password);
  };
 
  const validateForm = (formData) => {
    const errors = {};
 
    if (!validateText(formData.firstName)) {
      errors.firstName = "First name must only contain letters, space or \"-\"";
    }
 
    if (!validateText(formData.lastName)) {
      errors.lastName = "Last name must only contain letters, space or \"-\"";
    }

    if(!validateText(formData.city)){
      errors.city = "City must only contain letters, space or \"-\""
    }
 
    if (!validatePassword(formData.password)) {
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