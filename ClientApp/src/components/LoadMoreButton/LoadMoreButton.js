import React from "react";
import css from "./style.module.css";
import PostService from "../../API/PostService";
import { useFetching } from "../../hooks/useFetching";
import Loader from "../Loader/Loader";

function LoadMoreButton({ perPage, curPage, setLots, setCurPage }) {
  const [fetchLots, isLoading, lotsError] = useFetching(async () => {
    const response = await PostService.getAll(perPage, curPage);
    const data = await response.json();
    setLots(data.filter((_, i)=>i<(curPage+1)*perPage))
    setCurPage(curPage + 1);
  });
  if (isLoading) {
    return <Loader />;
  }
    
    
  
  if(curPage===0){
    fetchLots();
  }
  return (
    <div className={css.button} onClick={fetchLots}>
      Показати більше
    </div>
  );
}

export default LoadMoreButton;
