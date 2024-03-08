import React from "react";
import css from "./style.module.css";

function TimeSelector({ selected, onChange }) {
  const time = [1, 2, 5, 7, 10, 15, 20, 30];
  return (
    <div className={css.cont}>
      <select
      onChange={(e)=>onChange(e.target.value)}
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
