import React from 'react';
import css from './Checkbox.module.css'

const Checkbox = ({ title, info, name, checked, onChange }) => {
  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.checkboxContainer}>
          <input
            id={`customCheckbox${name}`}
            type="checkbox"
            className={css.checkboxInput}
            name={name}
            checked={checked} // Control the checked state
            onChange={onChange} // Handle changes
            hidden
          />
          <label for={`customCheckbox${name}`} className={css.checkboxLabel}></label>
        </div>

        <div>{title}</div>
      </div>
      <div className={css.info}>{info}</div>
    </div>
  );
};

export default Checkbox;