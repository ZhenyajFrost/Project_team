import React, { useEffect } from "react";
import useGetUserProfile from "../../API/User/Get/useGetUserProfile";
import Loader from "../Loader/Loader";
import css from "./style.module.css";

function Bid({ time, user, amount }) {


  const ukrainianMonths = [
    "січня",
    "лютого",
    "березня",
    "квітня",
    "травня",
    "червня",
    "липня",
    "серпня",
    "вересня",
    "жовтня",
    "листопада",
    "грудня",
  ];

  function formatDate(date) {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const ukrainianMonth = ukrainianMonths[monthIndex];
    return `${day} ${ukrainianMonth}`;
  }

  const userDisp =<p>{user.login}</p>;

  return (
    <div>
      {userDisp}
      <div className={css.fle}>
        <p>Дата ставки: {formatDate(new Date(time))}</p> <p>{amount}₴</p>
      </div>
    </div>
  );
}

export default Bid;
