import React from "react";
import css from "./style.module.css";

function TimeSelector({ onChange, value }) {
  const time = [1, 2, 5, 7, 10, 15, 20, 30];
  const days = (date) => {
    if(date<100){
      return date
    }
    if(typeof date === "string"){
      date=new Date(date)
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    return Math.round(Math.abs((date - new Date()) / oneDay));
  };
  if(!value){
    onChange(1);
  }
  if(!time.includes(days(value))){
    time.push(days(value))
    time.sort();
  }
  return (
    <div className={css.cont}>
      <select
      value={days(value)}
        onChange={(e) => onChange(e.target.value)}
        className={css.sel}
        children={time.map((v) => (
          <option value={v} key={v}>
            {v} днів
          </option>
        ))}
      />
    </div>
  );
}

export default TimeSelector;
