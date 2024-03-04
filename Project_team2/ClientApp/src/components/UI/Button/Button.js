import React from 'react';
import classes from './Button.module.css';

const Button = ({children, className, ...props}) => {
    const combinedClasses = `btn btn-dark ${classes.btn} ${className || ''}`;

    return (
        <button {...props} className={combinedClasses}>
            {children}
        </button>
    );
};

export default Button;
