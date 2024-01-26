import React, { useState } from "react";
import { useEffect } from "react";
import "./style.css";
import MoneySvg from "./attach_money.svg";
import { NavLink } from "react-router-dom";
const vidminDays = (days) => {
  days = days.toString();
  const dlen = days.length;
  const lnum = Number(days[dlen - 1]);
  return dlen > 1 && days[dlen - 2] !== 1
    ? "днів"
    : lnum === 1
    ? "день"
    : lnum < 5 && lnum > 0
    ? "дні"
    : "днів";
};
const vidminHours = (hours) => {
  switch (hours) {
    case 1:
    case 21:
      return "година";
    case 2:
    case 3:
    case 4:
    case 22:
    case 23:
    case 24:
      return "години";
    default:
      return "годин";
  }
};
const vidminMinutes = (minutes) => {
  minutes = minutes.toString();
  const dlen = minutes.length;
  const lnum = Number(minutes[dlen - 1]);
  return dlen > 1 && minutes[dlen - 2] === 1
    ? "хвилин"
    : lnum === 1
    ? "хвилина"
    : lnum < 5 && lnum > 0
    ? "хвилини"
    : "хвилин";
};
export const formatTime = (seconds) => {
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  return (
    days +
    " " +
    vidminDays(days) +
    " " +
    hours +
    " " +
    vidminHours(hours) +
    " " +
    minutes +
    " " +
    vidminMinutes(minutes)
  );
};

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
  const [ttl, setTtl] = useState(timeTillEnd);
  useEffect(() => {
    setTimeout(() => {
      setTtl(ttl - 1);
    }, 1000);
  }, [ttl]);
  return (
    <div className="lot">
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
            {formatTime(timeTillEnd)}
          </p>
           <NavLink to={"/lot/" + id} className="arrow-outward"><svg>
            <use href={`${MoneySvg}#arrow_outward`}/> 
           </svg></NavLink>
          
        </div>
      </div>
    </div>
  );
}

export default Lot;
