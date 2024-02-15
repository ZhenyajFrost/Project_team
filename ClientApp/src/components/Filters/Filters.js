import React, { useEffect, useState } from "react";
import regions from "./regions.json";
import cts from "./categories.json";
import css from "./styles.module.css";
import Notiflix from "notiflix";

function Filters({ onChange, initial }) {
  console.log(initial)
  const [categories, setCategories] = useState(cts)
  const [params, setParams] = useState({
    category: categories[0],
    minPrice: 1,
    maxPrice: Infinity,
    endTill: new Date(new Date().getDate() + 1),
    region: regions[0],
    ...initial
  });
  console.log("d"+params)
  useEffect(() => {



    //перевірка, чи не була категорія змінена інспект елементом
    if (!categories.includes(params.category)) {
      Notiflix.Notify.failure(
        "Будь ласка, не вийобуйтесь і оберіть нормальну категорію."
      );
      return;
    }

   

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

    //регіон чек
    if (!regions.includes(params.region)) {
      Notiflix.Notify.failure(
        "Будь ласка, не вийобуйтесь і оберіть нормальну облсть."
      );
      return;
    }
    console.log("fiuuuuuck")
    onChange(params)
  }, [params]);

  return (
    <>
      <h2>Фільри</h2>
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
              setParams({ ...params, endTill: e.target.value });
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
