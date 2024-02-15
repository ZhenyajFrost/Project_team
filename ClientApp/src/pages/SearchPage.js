import React, { useEffect, useState } from "react";
import InputSearch from "../components/UI/Input/InputSearch";
import Filters from "../components/Filters/Filters";
import { NavLink } from "react-bootstrap";
import svg from "../images/images.svg";
import css from "../styles/Serch.module.css";
import LotContainer from "../components/UI/LotContainer/LotContainer";
import { useFetching } from "../hooks/useFetching";
import PostService from "../API/PostService";
import Loader from "../components/Loader/Loader";

function SearchPage(props) {
  const [querry, setQuerry] = useState(
    decodeURI(
      window.location.href.split("/")[
        window.location.href.split("/").length - 1
      ]
    )
  );
  const [oldQuerry, setOldQuerry] = useState("");
  const [filter, setFilter] = useState({});
  const [lots, setLots] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const perPage = 7;
  const [lotDisplay, setLotDisplay] = useState("list");
  const [fetchLots, isLoading] = useFetching(async () => {
    const response = await PostService.getAll(perPage, curPage);
    const data = await response.json();
    setLots(data.filter((_, i) => i < (curPage + 1) * perPage));
    setCurPage(curPage + 1);
  });

  useEffect(() => {
    const doFetching = () => {
      setCurPage(1);
      setLots([]);
      fetchLots();
      setOldQuerry(querry);
    };
    if (oldQuerry !== querry) doFetching();
  }, [querry, filter, fetchLots, oldQuerry]);

  useEffect(()=>{
    let args = window.location.href.split("?")[1];
    if(args){
      args = args.split("/")[0];
      const obj = {};
      args.split("&").forEach(v=>{
          obj[v.split("=")[0]]= v.split("=")[1];
      })
      setFilter(obj);
    }
  }, [])
  const onFilterChange = (e) => {
    setFilter(e);
  };
  return (
    <div className={css.searchContainer}>
      <div className={css.searchFieldWrap}>
        <label className={css.searchFieldLabel}>Пошук</label>
        <InputSearch onSearch={(e) => setQuerry(e)} value={querry} />
      </div>
      <Filters onChange={onFilterChange} initial={filter}/>
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
          <svg onClick={() => setLotDisplay("grid")}>
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
        <LotContainer display={lotDisplay} lots={lots} setLots={setLots} />
      )}
    </div>
  );
}

export default SearchPage;
