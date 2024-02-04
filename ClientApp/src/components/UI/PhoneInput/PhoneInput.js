import React from 'react';
import InputMask from 'react-input-mask';
import classes from '../../../styles/Input.module.css'

const PhoneInput = ({name, value, onChange }) => {
  return (
    <InputMask
      className={classes.input}
      mask="+38 (999) 999-99-99"
      placeholder="+38 (___) ___-__-__"
      name={name}
      value={value}
      onChange={onChange}
      max={10}
    />
  );
};

export default PhoneInput;