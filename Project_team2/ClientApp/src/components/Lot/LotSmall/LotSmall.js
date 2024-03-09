import React, { useState } from "react";
import { useEffect } from "react";
import svg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import css from "./LotSmall.module.css"
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import useDeleteLot from "../../../API/Lots/useDeleteLot";

function LotSmall({
  id,
  title,
  price,
  shortDescription,
  timeTillEnd,
  imageURL,
  location,
}) {
  const history = useHistory();

  const [ttl, setTtl] = useState(timeTillEnd);
  const { deleteLot, isLoading, error } = useDeleteLot();
  useEffect(() => {
    setTimeout(() => {
      setTtl(ttl - 1);
    }, 1000);
  }, [ttl]);
  const [dots, setDots] = useState(false);
  const [thing, setThing] = useState(false);

  return (
    <div className={css.lot} onMouseEnter={()=>setDots(true)} onMouseLeave={()=>setDots(false)}>
      {dots ? (
        <div className={css.dots} onClick={() => setThing(!thing)}>
          <svg>
            <use href={`${svg}#dots_vertical`} />
          </svg>
          {thing ? (
            <div className={css.thing}>
              <p>
                <NavLink to={`/edit/${id}`}>Редагувати</NavLink>
              </p>
              <p onClick={() => console.log("arch")}>Перемістити в архів</p>
              <p onClick={() => console.log("act")}>Перемістити в активні</p>
              <hr />
              <p
                className={css.delete}
                onClick={() => {
                  if (window.confirm("Ви точно хочете видалити " + title))
                    deleteLot(id);
                }}
              >
                Видалити
              </p>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      <img
        src={
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzj49rb70qayLcsE_g-Bl54iw3sMoJsZRfLbU-tQOqWQ&s"
        }
        className={css.image}
        alt="oleg"
      />
      <div className={css.info}>
        <div className={css.title}>{title}</div>
        <div className={css.desc}>{shortDescription}</div>
        <div className={css.text}>
          <svg>
            <use href={`${svg}#schedule`} />
          </svg>
          {formatTime(ttl)}
        </div>
        <div className={`${css.bottom}`}>
          <div className={css.text}>
            <svg>
              <use href={`${svg}#attach_money`} />
            </svg>
            {price}
          </div>
          <div className={css.text}>
            <svg>
              <use href={`${svg}#attach_money`} />
            </svg>
            {location ? location : "Location"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LotSmall;
