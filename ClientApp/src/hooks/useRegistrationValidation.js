import { useState } from "react";
 
const useRegistrationValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
 
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(name);
  };
 
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    
      return passwordRegex.test(password);
  };
 
  const validateForm = (formData) => {
    const errors = {};
 
    if (!validateName(formData.firstName)) {
      errors.firstName = "First name must only contain letters.";
    }
 
    if (!validateName(formData.lastName)) {
      errors.lastName = "Last name must only contain letters.";
    }
 
    if (!validatePassword(formData.password)) {
      errors.password =
        "Password must have a minimum of 8 characters, at least one lowercase letter, one uppercase letter, and one special symbol.";
    }
 
    setValidationErrors(errors);

    // Return true if there are no validation errors
    return Object.keys(errors).length === 0;
  };

  console.log(validationErrors);
  return { validationErrors, validateForm };
};
 
export default useRegistrationValidation;