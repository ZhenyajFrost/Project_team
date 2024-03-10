import React, { useEffect } from "react";
import css from "./style.module.css";
import Loader from "../Loader/Loader";
import Button from "../UI/Button/Button";

function LoadMoreButton({ curPage, setCurPage }) {
  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <Button className={css.button} style={{ display: 'block', margin: 'auto' }} onClick={() => setCurPage(curPage + 1)}> Показати більше</Button>
  );
}

export default LoadMoreButton;
