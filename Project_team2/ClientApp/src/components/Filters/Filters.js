import React, { useEffect, useState } from "react";
import regions from "../../Data/regions.json";
import cts from "../../Data/categories.json";
import css from "./styles.module.css";
import Notiflix, { Notify } from "notiflix";

function Filters({ onChange, initial }) {
  const [categories, setCategories] = useState([
    { title: "Будь-яка категорія", id: -1, imgId: "any" },
    ...cts,
  ]);
  const [params, setParams] = useState({
    minPrice: 1,
    maxPrice: 10000000,
    region: "Будь-який",
    ...initial,
  });
  useEffect(() => {
    //перевірка ціни
    const minPrice = Number(params.minPrice);
    const maxPrice = Number(params.maxPrice);
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      Notiflix.Notify.failure("Будь ласка, оберіть нормальну ціну.");
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
    for (let a in params) {
      if (params[a] !== initial[a] && params[a]) {
        onChange(params);
        return;
      }
    }
  }, [params, categories, onChange]);
  const selCat = categories.find(
    (v) => Number(v.id) === Number(initial.category)
  );
  console.log(selCat);
  return (
    <div className={css.filterContainer}>
      <div className={css.filterItem}>
        Нові лоти за
        <select
          className={css.inputEl}
          value={initial.category}
          onChange={(e) => {
            setParams({ ...params, category: e.target.value });
          }}
        >
          {selCat ? (
            <option value={initial.category}>{selCat.title}</option>
          ) : (
            ""
          )}
          {categories.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
      </div>
      <div className={css.filterItem}>
        Ціна
        <div className={css.priceContainer}>
          <div className={css.inputEl}>
            Від:
            <input
              type="number"
              value={params.minPrice}
              onChange={(e) => {
                setParams({ ...params, minPrice: e.target.value });
              }}
            />
          </div>

          <div className={css.inputEl}>
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
            setParams({ ...params, timeTillEnd: e.target.value });
          }}
        >
          <option>Всі оголошення</option>
        </select>
      </div>
      <div className={css.filterItem}>
        Регіон:
        <select
          className={css.inputEl}
          onChange={(e) => {
            setParams({ ...params, region: e.target.value });
          }}
        >
          <option>Будь-який</option>
          {regions.map((v) => (
            <option>{v.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Filters;
