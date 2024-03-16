import React, { useState } from "react";
import classes from "../../../styles/InputSearch.module.css";
import search from "../../../images/search.svg";
import Button from "../Button/Button";

// -- Search without button
// const InputSearch = React.forwardRef((props, ref) => {
//     return (
//         <div className={classes.search}>
//             <img src={seacrh} className={classes.seacrh}/>
//             <input ref={ref} className={classes.input} {...props}/>
//             <button type="button" className={"btn btn-dark " + classes.button}>Пошук</button>
//         </div>
//     );
// });

const InputSearch = ({ onSearch, placeholder = "", value = null, nobutton }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (nobutton && onSearch) {
      onSearch(newValue); // Directly call onSearch when `nobutton` is true
    }
  };

  const handleSearchClick = () => {
    if (onSearch && !nobutton) {
      onSearch(inputValue); // Only invoke onSearch on button click when `nobutton` is false
    }
  };

  return (
    <div className={classes.search}>
      <div>
        <img src={search} className={classes.search} alt="Search" />
        <input
          type="text"
          className={classes.input}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </div>

      {!nobutton && <Button onClick={handleSearchClick}>Пошук</Button>}
    </div>
  );
};

export default InputSearch;
