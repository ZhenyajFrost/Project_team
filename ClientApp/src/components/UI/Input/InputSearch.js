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

const InputSearch = ({ onSearch, placeholder="", value="" }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(inputValue);
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

      <Button onClick={handleSearchClick}>Пошук</Button>
    </div>
  );
};

export default InputSearch;
