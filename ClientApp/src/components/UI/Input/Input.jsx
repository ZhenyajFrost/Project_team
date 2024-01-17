import React from 'react';
import classes from './Input.module.css';

const Input = React.forwardRef((props, ref) => {
    return (
        <input ref={ref} className={classes.input} {...props}/>
    );
});

export default Input;
