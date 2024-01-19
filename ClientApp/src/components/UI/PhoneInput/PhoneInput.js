import React from 'react';
import InputMask from 'react-input-mask';
import classes from '../../../styles/Input.module.css'

const PhoneInput = ({ value, onChange }) => {
  return (
    <InputMask
    className={classes.input}
      mask="+38 (999) 999-99-99"
      placeholder="+38 (___) ___-__-__"
      value={value}
      onChange={onChange}
    />
  );
};

export default PhoneInput;