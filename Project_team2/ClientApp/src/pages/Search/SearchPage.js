import React, { useEffect, useState } from "react";
import InputSearch from "../../components/UI/Input/InputSearch";
import Filters from "../../components/Filters/Filters";
import { NavLink } from "react-bootstrap";
import svg from "../../images/images.svg";
import categories from "../../Data/categories.json"
import css from "./Serch.module.css";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import Loader from "../../components/Loader/Loader";
import useGetLots from "../../API/Lots/Get/useGetLots";
import { Notify } from "notiflix";


function SearchPage(props) {
  const [querry, setQuerry] = useState(
    decodeURI(
      window.location.href.split("/")[
        window.location.href.split("/").length - 1
      ]
    )
  );
  const [oldQuerry, setOldQuerry] = useState("");
  const [oldFilter, setOldFilter] = useState({});
  const [filter, setFilter] = useState({});
  const [curPage, setCurPage] = useState(1);
  const perPage = 7;
  const [lotDisplay, setLotDisplay] = useState("list");
  const [getLots, lots, totalCount, isLoading, error] = useGetLots();

  //fetch data
  useEffect(() => {
    const doFetching = () => {
      setCurPage(1);
      getLots(curPage, perPage, filter);
      setOldQuerry(querry);
      setOldFilter(filter);
    };
    if (oldQuerry !== querry || oldFilter !== filter) doFetching();
  }, [querry, filter, oldQuerry, getLots, curPage, oldFilter]);

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
    Notify.failure(JSON.stringify(e))
    if (e.category === -1) {
      e.category = undefined;
    }
    setFilter(e);
  };
  console.log(filter)
  return (
    <>
      <div className={css.searchContainer}>
        <div className={css.searchFieldWrap}>
          <label className={css.searchFieldLabel}>Пошук</label>
          <InputSearch onSearch={(e) => setQuerry(e)} value={querry} />
        </div>
        <p className={css.head}>Фільтри</p>
        <Filters onChange={onFilterChange} initial={filter} />
        <hr></hr>
        <div className={css.upThing}>
          <NavLink href="/">На головну</NavLink>
          <div>
            <div>
              Сортувати за:{" "}
              <select>
                <option>Як ми це зробимо?</option>
              </select>
            </div>
            <svg onClick={() => setLotDisplay("grid-2col")}>
              <use href={`${svg}#gridView`} />
            </svg>
            <svg onClick={() => setLotDisplay("list")}>
              <use href={`${svg}#listView`} />
            </svg>
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <LotContainer display={lotDisplay} lots={lots} />
        )}
      </div>
    </>
  );
}

export default SearchPage;
