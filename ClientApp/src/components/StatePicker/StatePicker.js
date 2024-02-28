import React from "react";
import css from "./style.module.css";

function StatePicker({ current, change }) {
  const handleClick = (e) => {
    change(e.target.innerText);
  };
  return (
    <div className={css.statecont}>
      <span onClick={handleClick} className={css.state}>
        Нове
      </span>
      <span onClick={handleClick} className={css.state}>
        Вживане
      </span>
      <span className={css.slider} style={current === "Нове" ? {transform:"translate(0px, 0)"} : {transform:"translate(57px, 0)"}}>{current}</span>
    </div>
  );
}

export default StatePicker;
