import React from "react";
import css from "./style.module.css";
import PostService from "../../API/PostService";
import { useFetching } from "../../hooks/useFetching";
import Loader from "../Loader/Loader";
import Button from "../UI/Button/Button";

function LoadMoreButton({ perPage, curPage, setLots, setCurPage }) {
  const [fetchLots, isLoading] = useFetching(async () => {
    await setLots()
    setCurPage(curPage + 1);
  });
  
  if (isLoading) {
    return <Loader />;
  }
  
  if(curPage===0){
    fetchLots();
  }
  return (
    // <div className={css.button} onClick={fetchLots}>
    //   Показати більше
    // </div>
    <Button className={css.button} style={{display: 'block', margin: 'auto'}} onClick={fetchLots}> Показати більше</Button>
  );
}

export default LoadMoreButton;