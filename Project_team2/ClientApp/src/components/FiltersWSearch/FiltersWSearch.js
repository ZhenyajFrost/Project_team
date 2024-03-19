import React, { useEffect, useState } from "react";
import css from "./FiltersWSearch.module.css";
import Notiflix from "notiflix";
import InputSearch from "../UI/Input/InputSearch";

function FiltersWSearch({ onChange, initial }) {
  const [filters, setFilters] = useState({
    searchQuery: null,
    minPrice: null,
    maxPrice: null,
    timeTillEnd: null,
    ...initial
  });

  useEffect(() => {
    //перевірка ціни
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      Notiflix.Notify.failure("Будь ласка оберіть нормальну ціну.");
      return;
    }

    if (minPrice < 0) {
      setFilters((prev) => ({ ...prev, minPrice: minPrice * -1 }));
      return;
    }

    if (maxPrice < 0) {
      setFilters((prev) => ({ ...prev, maxPrice: maxPrice * -1 }));
      return;
    }
    if (maxPrice < minPrice) {
      Notiflix.Notify.failure("Ціна 'від' не може бути більшою, ніж ціна 'до'");
      return;
    }

    //перевірка дати
    //хз як з датою працюватимемо (об'єкт, стрінг чи щось тому подібне), тож залишу це пустим

    console.log("Filters changed in FiltersWSearch")

    const appliedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      // Exclude properties with null values
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onChange(appliedFilters)
  }, [filters]);

  const onSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: value,
    }));
  };

  return (
    <div className={css.filterContainer}>
      <div className={css.filterItem}>
        Пошук
        <InputSearch
          onSearch={onSearch}
          value={filters.searchQuery}
          placeholder="Введіть будь-яку позицію"
          nobutton
        />
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
            setFilters({ ...filters, timeTillEnd: e.target.value });
          }}
        >
          <option>Всі оголошення</option>
        </select>
      </div>
      <div>
        Сортувати за:
        <div
          className={css.inputEl}
          style={{ display: "flex", overflow: "hidden" }}
        >
          <select
            onChange={(v) => {
              const [orderBy, ascending] = v.target.value.split(" ");
              setFilters({
                ...filters,
                orderBy,
                ascending: ascending === "true",
              });
            }}
          >
            <option value="">Довільний порядок</option>
            <option value="title true">За назвою вверх</option>
            <option value="title false">За назвою вниз</option>
            <option value="category true">За категорією вверх</option>
            <option value="category false">За категорією вниз</option>
            <option value="timeTillEnd true">
              За часом до закінчення вверх
            </option>
            <option value="timeTillEnd false">
              За часом до закінчення вниз
            </option>
            <option value="minPrice true">За мінімальною ціною вверх</option>
            <option value="minPrice false">За мінімальною ціною вниз</option>
            <option value="minStepPrice true">
              За мінімальним кроком ціни вверх
            </option>
            <option value="minStepPrice false">
              За мінімальним кроком ціни вниз
            </option>
            <option value="price true">За ціною вверх</option>
            <option value="price false">За ціною вниз</option>
            <option value="isNew true">За новизною вверх</option>
            <option value="isNew false">За новизною вниз</option>
            <option value="region true">За регіоном вверх</option>
            <option value="region false">За регіоном вниз</option>
            <option value="city true">За містом вверх</option>
            <option value="city false">За містом вниз</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FiltersWSearch;
