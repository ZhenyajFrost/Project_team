import React, { useEffect, useState } from "react";
import css from "./FiltersWSearch.module.css";
import Notiflix from "notiflix";
import InputSearch from '../UI/Input/InputSearch'

function FiltersWSearch({ onChange, initial }) {
  console.log(initial)
  const [filters, setFilters] = useState({
    searchQuery: "",
    minPrice: 1,
    maxPrice: Infinity,
    endTill: new Date(new Date().getDate() + 1),
    ...initial
  });

  console.log("d" + filters)

  useEffect(() => {
    //перевірка ціни
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      Notiflix.Notify.failure(
        "Будь ласка, не вийобуйтесь і оберіть нормальну ціну."
      );
      return;
    }

    if (minPrice < 0) {
      setFilters(prev => ({ ...prev, minPrice: (minPrice * -1)}));
      return;
    }

    if (maxPrice < 0) {
      setFilters(prev => ({ ...prev, maxPrice: maxPrice * -1 }));
      return;
    }
    if (maxPrice < minPrice) {
      Notiflix.Notify.failure("Ціна 'від' не може бути більшою, ніж ціна 'до'");
      return;
    }

    //перевірка дати
    //хз як з датою працюватимемо (об'єкт, стрінг чи щось тому подібне), тож залишу це пустим

    console.log("fiuuuuuck")
    onChange(filters)
  }, [filters]);

  const onSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: value
    }));
  }
  

  return (
    <div className={css.filterContainer}>
      <div className={css.filterItem}>
        Пошук
        <InputSearch onSearch={onSearch} value={filters.searchQuery} placeholder="Введіть будь-яку позицію" nobutton />
      </div>
      <div className={css.filterItem}>
        Ціна
        <div className={css.priceContainer}>
          <div className={`${css.inputEl} ${css.price}`}>
            Від:
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => {
                setFilters({ ...filters, minPrice: e.target.value });
              }}
            />
          </div>

          <div className={`${css.inputEl} ${css.price}`}>
            До:
            <input
              type="number"
              value={filters.maxPrice}

              onChange={(e) => {
                setFilters({ ...filters, maxPrice: e.target.value });
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
            setFilters({ ...filters, endTill: e.target.value });
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
