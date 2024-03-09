import React, { useState } from "react";
import { useEffect } from "react";
import "./style.css";
import MoneySvg from "../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../utils/formatTime";

function Lot({
  id,
  title,
  price,
  shortDescription,
  category,
  timeTillEnd,
  hot,
  imageURL,
  openModal,
}) {
  const [ttl, setTtl] = useState(new Date(timeTillEnd) - new Date());
  useEffect(() => {
    if (ttl > 0)
      setTimeout(() => {
        setTtl(ttl - 1);
      }, 1000);
  }, [ttl]);
  return (
    <div className={`lot ${ttl>0?"active" : "inactive"}`}>
      <img
        src={
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzj49rb70qayLcsE_g-Bl54iw3sMoJsZRfLbU-tQOqWQ&s"
        }
        className="lot-image"
        alt="oleg"
      />
      <div className="lot-text">
        <h3 className="lot-title">{title}</h3>
        <p className="lot-desc">{shortDescription}</p>

        <div className="lot-info">
          <p>
            <svg>
              <use href={`${MoneySvg}#attach_money`} />
            </svg>
            {price}
          </p>
          <p>
            <svg>
              <use href={`${MoneySvg}#schedule`} />
            </svg>
            {formatTime(ttl)}
          </p>
          <NavLink to={"/lot/" + id} className="arrow-outward">
            <svg>
              <use href={`${MoneySvg}#arrow_outward`} />
            </svg>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Lot;
