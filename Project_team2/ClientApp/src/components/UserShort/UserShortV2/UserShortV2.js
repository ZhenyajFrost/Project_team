import React from "react";
import css from "./UserShortV2.module.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import svgStat from "../../../images/status.svg";
import svg from "../../../images/svgDef.svg";
import UserLikeButton from "../../UI/LikeButton/UserLikeButton";
import { useState } from "react";
import Reputation from "../Reputation";

function UserShortV2({
  user: {
    id,
    avatar,
    login,
    city,
    region,
    status = { imgId: "norm", value: "Нормальний" },
  },
}) {
  //STATUS
  const history = useHistory();

  const [likeVisible, setLikeVisible] = useState(true); // false if hover

  return (
    //onMouseEnter={() => setLikeVisible(true)} onMouseLeave={() => setTimeout(() => setLikeVisible(true), 1000)}
    <div className={css.container}>
      <div className={css.info} onClick={() => history.push(`/user/${id}`)}>
        <img src={avatar} alt="user avatar" className={css.avatar} />
        <div className={css.header}>
          <div className={css.login}>{login}</div>
          <div className={css.location}>
            <svg>
              <use href={`${svg}#location`} />
            </svg>{" "}
            {`${region}  м.${city ? city : "Місто"}`}
          </div>
        </div>
      </div>
      {likeVisible ? (
        <UserLikeButton className={css.like} userId={id} />
      ) : (
        <></>
      )}

      <Reputation reputation={status}/>
      
    </div>
  );
}

export default UserShortV2;
