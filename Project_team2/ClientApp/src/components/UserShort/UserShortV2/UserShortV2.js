import React, {useEffect} from "react";
import css from "./UserShortV2.module.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import svg from "../../../images/svgDef.svg";
import UserLikeButton from "../../UI/LikeButton/UserLikeButton";
import { useState } from "react";
import Reputation from "../Reputation";
import useGetUserReputation from "../../../API/User/Get/useGetReputation";

function UserShortV2({ user: { id, avatar, login, city, region } }) {
  //STATUS
  const history = useHistory();
  const [get, status] = useGetUserReputation();
  const [likeVisible, setLikeVisible] = useState(true); // false if hover
  useEffect(() => {
    get(id);
  }, []);

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

      <Reputation reputation={status} />
    </div>
  );
}

export default UserShortV2;
