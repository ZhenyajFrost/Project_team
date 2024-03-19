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
  const querry = decodeURI(
    window.location.href.split("/")[window.location.href.split("/").length - 1]
  );
  function formatDate(date) {

    if(!date || !date.getFullYear){
      if(!date || date<0){
        return;
      }
      const today = new Date(Date.now());
    console.log(today.getDate()+date);

      date = new Date(new Date().setDate(Number(today.getDate())+Number(date)))
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
    minPrice: 1,
    maxPrice: 10000000,
    region: "Будь-який",
    isNew: undefined,
    orderBy: "",
    timeTillEnd:undefined,
    searchString:querry
  };
  const [oldFilter, setOldFilter] = useState({});
  const [filter, setFilter] = useState({ ...initial });
  const [curPage, setCurPage] = useState(1);
  const perPage = 7;
  const [lotDisplay, setLotDisplay] = useState("list");
  const [getLots, lots, totalCount, isLoading, error] = useGetLots();
  const [changed, setChanged] = useState({});

  useEffect(() => {
    const res = {};
    for (let a in filter) {
      if (filter[a] !== changed[a]) {
        if(!filter[a] || filter[a]<0 || filter[a]==="Будь-який"){
          res[a]= undefined;
        }else{
          res[a] = filter[a];

        }
      }
    }
    setChanged(res);
  }, [filter]);

  //fetch data
  useEffect(() => {
    const doFetching = () => {
      setCurPage(1);
      changed.timeTillEnd = formatDate(changed.timeTillEnd);
      getLots(curPage, perPage, changed);
      setOldFilter(changed);
    };
    if (oldFilter !== changed && !isLoading) doFetching();
  }, [getLots, curPage, oldFilter, changed, isLoading]);

  //get data from url
  useEffect(() => {
    let args = window.location.href.split("?")[1];
    if (args) {
      args = args.split("/")[0];
      const obj = {};
      args.split("&").forEach((v) => {
        obj[v.split("=")[0]] = v.split("=")[1];
      });
      onFilterChange(obj);
    }
  }, []);
  const onFilterChange = (e) => {
    console.log(e);
    setFilter({ ...filter, ...e });
  };

  return (
    <>
      <div className={css.searchContainer}>
        <div className={css.searchFieldWrap}>
          <label className={css.searchFieldLabel}>Пошук</label>
          <InputSearch
            onSearch={(e) => setFilter({ ...filter, searchString: e })}
            value={filter.searchString}
          />
        </div>
        <p className={css.head}>Фільтри</p>
        <Filters onChange={onFilterChange} initial={filter} />
        <hr />
        <div className={css.upThing}>
          <NavLink href="/">На головну</NavLink>
          <div>
            <div>
              Сортувати за:{" "}
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
            <DisplayChoose
              setLotDisplay={setLotDisplay}
              lotDisplay={lotDisplay}
            />
          </div>
        </div>
        {isLoading && lots ? (
          <Loader />
        ) : (
          <LotContainer
            display={lotDisplay}
            lotStyle={lotDisplay === "listWrap" ? "small" : "basic"}
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
