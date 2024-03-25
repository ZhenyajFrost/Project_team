import React, { useEffect, useState } from "react";
import InputSearch from "../../components/UI/Input/InputSearch";
import Filters from "../../components/Filters/Filters";
import { NavLink } from "react-bootstrap";
import svg from "../../images/images.svg";
import categories from "../../Data/categories.json";
import css from "./Serch.module.css";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import Loader from "../../components/Loader/Loader";
import useGetLots from "../../API/Lots/Get/useGetLots";
import { Notify } from "notiflix";
import Pagination from "../../components/UI/Pagination/Pagination";
import DisplayChoose from "../../components/UI/DisplayChoose/DisplayChoose";

function SearchPage(props) {
  function formatDate(date) {
    if (!date || !date.getFullYear) {
      if (!date || date < 0) {
        return;
      }
      const today = new Date(Date.now());
      if (isNaN(Number(date))) {
        return date;
      }
      date = new Date(
        new Date().setDate(Number(today.getDate()) + Number(date))
      );
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  const initial = {
    minPrice: undefined,
    maxPrice: undefined,
    region: "Будь-який",
    isNew: undefined,
    orderBy: "",
    timeTillEnd: undefined,
    searchString: undefined,
  };
  const types = {
    minPrice: (e) => Number(e),
    maxPrice: (e) => Number(e),
    region: (e) => decodeURI(e),
    isNew: (e) => e === "true",
    ascending: (e) => e === "true",
    orderBy: (e) => e,
    timeTillEnd: (e) => new Date(e),
    searchString: (e) => decodeURI(e),
    category: (e) => e,
  };
  const [filter, setFilter] = useState({ ...initial });
  const [curPage, setCurPage] = useState(1);
  const [lotDisplay, setLotDisplay] = useState("list");
  const perPage = 7;
  const [getLots, lots, totalCount, isLoading, error] = useGetLots();
  const [changed, setChanged] = useState({});

  //get data from url
  useEffect(() => {
    let args = window.location.href.split("?")[1];
    if (args) {
      args = args.split("/")[0];
      const obj = {};
      args.split("&").forEach((v) => {
        const key = v.split("=")[0];
        const value = v.split("=")[1];

        if (key) obj[key] = types[key](value);
      });
      console.log(obj);
      setFilter(obj);
    }
  }, []);

  useEffect(() => {
    const res = {};
    for (let a in filter) {
      if (filter[a] !== changed[a]) {
        if (!filter[a] || filter[a] < 0 || filter[a] === "Будь-який") {
          res[a] = undefined;
        } else {
          res[a] = filter[a];
        }
      }
    }
    setChanged({ ...changed, ...res });
  }, [filter]);

  //fetch data
  const doFetching = (searchString) => {
    setCurPage(1);
    changed.timeTillEnd = formatDate(changed.timeTillEnd);
    changed.searchString = searchString;
    getLots(curPage, perPage, changed);

    let location = "?";
    for (const key in changed) {
      if (changed[key]) location += key + "=" + changed[key] + "&";
    }
    window.history.replaceState(
      null,
      "Exestic",
      window.location.href.split("?")[0] + location
    );
  };
  useEffect(() => {
    doFetching(filter.searchString);
  }, [changed]);
  const onFilterChange = (e) => {
    setFilter({ ...filter, ...e });
  };
  const isPhone = window.screen.width <= 375;
  return (
    <>
      <div className={css.searchContainer}>
        <div className={css.searchFieldWrap}>
          <label className={css.searchFieldLabel}>Пошук</label>
          <InputSearch onSearch={doFetching} value={filter.searchString} />
        </div>
        <p className={css.head}>Фільтри</p>
        <Filters onChange={onFilterChange} current={filter} />
        <hr />
        <div className={css.upThing}>
          {isPhone ? null : <NavLink href="/">На головну</NavLink>}
          <div>
            Сортувати за{" "}
            <div>
              <select
                onChange={(v) => {
                  const [orderBy, ascending] = v.target.value.split(" ");
                  onFilterChange({ orderBy, ascending: ascending === "true" });
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
                <option value="minPrice true">
                  За мінімальною ціною вверх
                </option>
                <option value="minPrice false">
                  За мінімальною ціною вниз
                </option>
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
            {isPhone ? null : (
              <DisplayChoose
                setLotDisplay={setLotDisplay}
                lotDisplay={lotDisplay}
              />
            )}
          </div>
        </div>
        {isLoading && lots ? (
          <Loader />
        ) : (
          <LotContainer
            display={lotDisplay}
            lotStyle={
              lotDisplay === "listWrap" || window.screen.width <= 375
                ? "small"
                : "basic"
            }
            lots={lots}
          />
        )}
        <Pagination
          totalCount={totalCount}
          limit={perPage}
          page={curPage}
          changePage={(e) => {
            setCurPage(e);
            getLots(e, perPage, changed);
          }}
        />
      </div>
    </>
  );
}

export default SearchPage;
