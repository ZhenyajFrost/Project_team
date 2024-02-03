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
  const [lots, setLots] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const perPage = 7;
  const [fetchLots, isLoading] = useFetching(async () => {
    const response = await PostService.getAll(perPage, curPage);
    const data = await response.json();
    setLots(data.filter((_, i) => i < (curPage + 1) * perPage));
    setCurPage(curPage + 1);
  });
  useEffect(() => {
    setCurPage(1);
    // setLots([]);
    //fetchLots();
    
  }, [setCurPage, fetchLots]);
  return (
    <div>
      <InputSearch onSearch={(e) => setQuerry} value={querry} />
      <Filters />
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
          <svg>
            <use href={`${svg}#listView`} />
          </svg>
          <svg>
            <use href={`${svg}#gridView`} />
          </svg>
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <LotContainer display="list" lots={lots} setLots={setLots} />
      )}
    </div>
  );
}

export default SearchPage;
