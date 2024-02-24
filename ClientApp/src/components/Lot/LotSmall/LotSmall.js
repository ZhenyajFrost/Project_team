import React, { useState } from "react";
import { useEffect } from "react";
import MoneySvg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import css from "./LotSmall.module.css"

function LotSmall({
  id,
  title,
  price,
  shortDescription,
  timeTillEnd,
  imageURL,
  location
}) {
  const [ttl, setTtl] = useState(timeTillEnd);
  useEffect(() => {
    setTimeout(() => {
      setTtl(ttl - 1);
    }, 1000);
  }, [ttl]);

  return (
    <div className={css.lot}>
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

        <div className={css.info}>
          <div className={css.text}>
            <svg>
              <use href={`${MoneySvg}#schedule`} />
            </svg>
            {formatTime(ttl)}
          </div>
          <div className={`${css.bottom}`}>
            <div className={css.text}>
              <svg>
                <use href={`${MoneySvg}#attach_money`} />
              </svg>
              {price}
            </div>
            <div className={css.text}>
              <svg>
                <use href={`${MoneySvg}#attach_money`} />
              </svg>
              {location ? location : "Location"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LotSmall;
