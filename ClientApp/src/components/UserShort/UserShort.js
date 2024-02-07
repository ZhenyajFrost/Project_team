import React from "react";
import css from "./style.module.css";

function UserShort({ user: { avatar, name, since, last } }) {
  return (
    <div className={css.gUs}>
      <img src={avatar} alt="ures ava" />
      <div>
        <span>{name}</span>
        <div>
          На Exestick з <b>{since}</b>
        </div>
        <div>Онлайн {last}</div>
      </div>
    </div>
  );
}

export default UserShort;
