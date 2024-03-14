import React from "react";
import css from "./style.module.css";

function UserShort({ user: { avatar, login, registrationTime, lastLogin } }) {
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
  function formatDateWithYear(date) {
    const monthIndex = date.getMonth();
    const ukrainianMonth = ukrainianMonths[monthIndex];
    const year = date.getFullYear();
    return `${ukrainianMonth} ${year}`;
  }

  return (
    <div className={css.gUs}>
      <img src={avatar} alt="ures ava" />
      <div>
        <span>{login}</span>
        <div>
          На Exestick з <b>{formatDateWithYear(new Date(registrationTime))}</b>
        </div>
        <div>Онлайн {formatDate(new Date(lastLogin))}</div>
      </div>
    </div>
  );
}

export default UserShort;
