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
  const [querry, setQuerry] = useState(
    decodeURI(
      window.location.href.split("/")[
        window.location.href.split("/").length - 1
      ]
    )
  );
  const initial = {
    category: -1,
    minPrice: 1,
    maxPrice: null,
    region: "Будь-який",
    isNew: undefined,
    sortBy: "",
  };

  const [oldQuerry, setOldQuerry] = useState("");
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
      if (filter[a] !== initial[a]) {
        res[a] = filter[a];
      }
    }
    setChanged(res);
    console.log("d");
  }, [filter]);

  //fetch data
  useEffect(() => {
    const doFetching = () => {
      setCurPage(1);
      getLots(curPage, perPage, changed);
      setOldQuerry(querry);
      setOldFilter(changed);
    };
    if (oldQuerry !== querry || oldFilter !== changed) doFetching();
  }, [querry, oldQuerry, getLots, curPage, oldFilter, changed]);

  //get data from url
  useEffect(() => {
    let args = window.location.href.split("?")[1];
    if (args) {
      args = args.split("/")[0];
      const obj = {};
      args.split("&").forEach((v) => {
        obj[v.split("=")[0]] = v.split("=")[1];
      });
      setFilter(obj);
    }
  }, []);
  const onFilterChange = (e) => {
    setFilter({ ...filter, ...e });
  };
  if (isLoading) {
    return <Loader />;
  }
  console.log(totalCount, perPage, curPage);

  return (
    <>
      <div className={css.searchContainer}>
        <div className={css.searchFieldWrap}>
          <label className={css.searchFieldLabel}>Пошук</label>
          <InputSearch onSearch={(e) => setQuerry(e)} value={querry} />
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
                  const [sortBy, ascending] = v.target.value.split(" ");
                  onFilterChange({ sortBy, ascending:ascending==="true" });
                }}
              >
                <option value="">Сортувати за:</option>
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
