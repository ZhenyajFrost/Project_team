import { VisibilityRounded } from '@mui/icons-material';
import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    border: '1px solid var(--borderColor)',
    borderRadius: '24px',
    //boxShadow: state.isFocused ? '0 0 0 1px blue' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'none' : 'gray',
    }
  }),
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isSelected ? 'none' : 'white',
    '&:hover': {
      backgroundColor: 'lightgray',
      zIndex: '1000'
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderColor: 'var(--borderColor)',
  }),
};

function CustomSelect({options, placeholder, ...props }) {
  return (
    <Select
    {...props}
      styles={customStyles}
      options={options}
      placeholder={placeholder}
    />
  );
}

export default CustomSelect;
