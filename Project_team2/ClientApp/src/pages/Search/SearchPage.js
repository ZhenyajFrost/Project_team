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
            <DisplayChoose
              setLotDisplay={setLotDisplay}
              lotDisplay={lotDisplay}
            />
          </div>
        </div>
        {isLoading && lots ? (
          <Loader />
        ) : (
          <LotContainer display={lotDisplay} lots={lots} />
        )}
        <Pagination
          totalCount={totalCount}
          limit={perPage}
          page={curPage}
          changePage={(e)=>{setCurPage(e); getLots(e, perPage, filter);}}
        />
      </div>
    </>
  );
}

export default SearchPage;
