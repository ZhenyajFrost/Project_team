import React, { useEffect } from "react";
import css from "./style.module.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Reputation from "./Reputation";
import useGetUserReputation from "../../API/User/Get/useGetReputation";
import Loader from "../Loader/Loader";

function UserShort({
  user: { id, avatar, login, registrationTime, lastLogin },
}) {
  const history = useHistory();

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
  const [getreputation, reputation, isLoading] = useGetUserReputation();
  useEffect(() => {
    getreputation(id);
  }, []);
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
    <div>
      <div className={css.gUs} onClick={() => history.push(`/user/${id}`)}>
        <img src={avatar} alt="ures ava" />
        <div>
          <span>{login}</span>
          <div>
            На Exestick з{" "}
            <b>{formatDateWithYear(new Date(registrationTime))}</b>
          </div>
          <div>Онлайн {formatDate(new Date(lastLogin))}</div>
        </div>
      </div>
      {isLoading ? <Loader /> : <Reputation reputation={reputation} />}
    </div>
  );
}

export default UserShort;
