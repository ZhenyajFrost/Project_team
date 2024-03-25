import React, { useEffect, useState } from "react";
import classes from "../../../styles/InputSearch.module.css";
import search from "../../../images/search.svg";
import Button from "../Button/Button";
import cssMod from '../NavMenu/css.module.css'

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

const InputSearch = ({
  onSearch,
  placeholder = "",
  value = null,
  nobutton,
}) => {
  const [inputValue, setInputValue] = useState();
  useEffect(()=>{
    setInputValue(value)
  }, [value])
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (nobutton && onSearch) {
      onSearch(newValue); // Directly call onSearch when `nobutton` is true
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (onSearch && !nobutton) {
      onSearch(inputValue); // Only invoke onSearch on button click when `nobutton` is false
    }
  };

  return (
    <form onSubmit={handleSearchClick}>
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

        {!nobutton && <Button className={cssMod.disappear} onClick={handleSearchClick}>Пошук</Button>}
      </div>
    </form>
  );
};

export default InputSearch;
