import React from "react";
import css from "./UserShortV2.module.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function UserShortV2({ user: { id, avatar, login, location, status } }) {
  const history = useHistory();

  return (
    <div className={css.gUs} onClick={() => history.push(`/user/${id}`)}>
      <img src={avatar} alt="ures ava" />
      <div>
        <span>{login}</span>
        <div>Онлайн</div>
      </div>
    </div>
  );
}

export default UserShortV2;
