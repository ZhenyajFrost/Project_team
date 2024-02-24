import React, { useEffect, useState } from "react";
import css from "./FiltersWSearch.module.css";
import Notiflix from "notiflix";
import InputSearch from '../UI/Input/InputSearch'

function FiltersWSearch({ onChange, initial }) {
  console.log(initial)
  const [params, setParams] = useState({
    minPrice: 1,
    maxPrice: Infinity,
    endTill: new Date(new Date().getDate() + 1),
    ...initial
  });
  console.log("d" + params)
  useEffect(() => {

    //перевірка ціни
    const minPrice = Number(params.minPrice);
    const maxPrice = Number(params.maxPrice);
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      Notiflix.Notify.failure(
        "Будь ласка, не вийобуйтесь і оберіть нормальну ціну."
      );
      return;
    }
    if (minPrice < 0) {
      setParams({ ...params, minPrice: minPrice * -1 });
      return;
    }
    if (maxPrice < 0) {
      setParams({ ...params, maxPrice: maxPrice * -1 });
      return;
    }
    if (maxPrice < minPrice) {
      Notiflix.Notify.failure("Ціна 'від' не може бути більшою, ніж ціна 'до'");
      return;
    }

    //перевірка дати
    //хз як з датою працюватимемо (об'єкт, стрінг чи щось тому подібне), тож залишу це пустим

    console.log("fiuuuuuck")
    onChange(params)
  }, [params]);

  return (
    <div className={css.filterContainer}>
      <div className={css.filterItem}>
        Пошук
        <InputSearch placeholder="Введіть будь-яку позицію" nobutton />
      </div>
      <div className={css.filterItem}>
        Ціна
        <div className={css.priceContainer}>
          <div className={`${css.inputEl} ${css.price}`}>
            Від:
            <input
              type="number"
              value={params.minPrice}
              onChange={(e) => {
                setParams({ ...params, minPrice: e.target.value });
              }}
            />
          </div>

          <div className={`${css.inputEl} ${css.price}`}>
            До:
            <input
              type="number"
              value={params.maxPrice}

              onChange={(e) => {
                setParams({ ...params, maxPrice: e.target.value });
              }}
            />
          </div>
        </div>
      </div>
      <div className={css.filterItem}>
        Що завершуються протягом:
        <select
          className={css.inputEl}
          onChange={(e) => {
            setParams({ ...params, endTill: e.target.value });
          }}
        >
          <option>Всі оголошення</option>
        </select>
      </div>
      <div className={css.filterItem}>
        Сортувати за:{" "}
        <select
          className={css.inputEl}>
          <option>Як ми це зробимо?</option>
        </select>
      </div>
    </div>
  );
}

export default FiltersWSearch;
