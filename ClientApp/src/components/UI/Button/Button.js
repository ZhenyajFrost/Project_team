﻿import React from 'react';
import classes from './Button.module.css';

const Button = ({children, ...props}) => {
    return (
        <button {...props} className={"btn btn-dark " + classes.btn}>
            {children}
        </button>
    );
};

export default Button;
