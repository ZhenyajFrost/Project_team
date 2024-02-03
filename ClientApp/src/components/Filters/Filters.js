import React from "react";
import regions from "./regions.json";
import css from "./styles.module.css";

function Filters({ onChange }) {
  const categories = ["designers", "suck"];

  return (
    <>
      <h2>Фільри</h2>
      <div className={css.filterContainer}>
        <div className={css.filterItem}>
          Нові лоти за
          <select className={css.inputEl}>
            <option>Будь-яка категорія</option>
            {categories.map((v) => (
              <option>{v}</option>
            ))}
          </select>
        </div>
        <div className={css.filterItem}>
          Ціна
          <div className={css.priceContainer}>
            <div className={css.inputEl}>
              Від:
              <input type="number" />
            </div>

            <div className={css.inputEl}>
              До:
              <input type="number" />
            </div>
          </div>
        </div>
        <div className={css.filterItem}>
          Що завершуються протягом:
          <select className={css.inputEl}>
            <option>Всі оголошення</option>
          </select>
        </div>
        <div className={css.filterItem}>
          Регіон:
          <select className={css.inputEl}>
            <option>Будь який</option>
            {regions.map((v) => (
              <option>{v}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default Filters;
