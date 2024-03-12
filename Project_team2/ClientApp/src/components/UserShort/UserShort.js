import React from "react";
import css from "./style.module.css";

function UserShort({ user: { avatar,  login, since, last } }) {
  return (
    <div className={css.gUs}>
      <img src={avatar} alt="ures ava" />
      <div>
        <span>{login  }</span>
        <div>
          На Exestick з <b>{since}</b>
        </div>
        <div>Онлайн {last}</div>
      </div>
    </div>
  );
}

export default UserShort;
