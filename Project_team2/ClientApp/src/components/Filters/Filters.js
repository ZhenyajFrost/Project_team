import React, { useEffect, useRef, useState } from "react";
import regions from "../../Data/regions.json";
import cts from "../../Data/categories.json";
import css from "./styles.module.css";
import { Notify } from "notiflix";

function Filters({ onChange, current }) {
  const [categories, setCategories] = useState([
    { title: "Будь-яка категорія", id: -1, imgId: "any" },
    ...cts,
  ]);
  const [params, setParams] = useState({
    minPrice: 1,
    maxPrice: 10000000,
    region: "Будь-який",
  });

  useEffect(() => {
    let args = window.location.href.split("?")[1];
    if (args) {
      args = args.split("/")[0];
      const obj = {};
      args.split("&").forEach((v) => {
        const key = v.split("=")[0];
        const value = decodeURIComponent(v.split("=")[1]);

        if (key) obj[key] = value;
      });
      setParams(obj);
    }
  }, []);

  useEffect(() => {
    //перевірка ціни
    const minPrice = Number(params.minPrice);
    const maxPrice = Number(params.maxPrice);
    if ((minPrice && isNaN(minPrice)) || (maxPrice && isNaN(maxPrice))) {
      Notify.failure("Будь ласка, оберіть нормальну ціну.");
      return;
    }
    if (minPrice && minPrice < 0) {
      setParams({ ...params, minPrice: minPrice * -1 });
      return;
    }
    if (maxPrice && maxPrice < 0) {
      setParams({ ...params, maxPrice: maxPrice * -1 });
      return;
    }
    if (maxPrice && minPrice && maxPrice < minPrice) {
      Notify.failure("Ціна 'від' не може бути більшою, ніж ціна 'до'");
      return;
    }

    for (let a in params) {
      if (params[a] && current[a] != params[a]) {
        onChange(params);
        return;
      }
    }
  }, [params, categories, onChange]);

  const selCat = categories.find(
    (v) => Number(v.id) === Number(params.category)
  );

  return (
    <div className={css.filterContainer}>
      <div className={css.filterItem}>
        Нові лоти за
        <select
          className={css.inputEl}
          value={params.category}
          onChange={(e) => {
            setParams({ ...params, category: e.target.value });
          }}
        >
          {selCat ? (
            <option value={params.category}>{selCat.title}</option>
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
          value={Math.ceil(
            (new Date(params.timeTillEnd) - new Date()) / (1000 * 60 * 60 * 24)
          )}
        >
          <option value={-1}>Всі оголошення</option>
          <option value={1}>1 дня</option>
          <option value={2}>2 днів</option>
          <option value={5}>5 днів</option>
          <option value={10}>10 днів</option>
          <option value={15}>15 днів</option>
          <option value={20}>20 днів</option>
          <option value={30}>30 днів</option>
        </select>
      </div>
      <div className={css.filterItem}>
        Регіон:
        <select
          className={css.inputEl}
          value={params.region}
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
