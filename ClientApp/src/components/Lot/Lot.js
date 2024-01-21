import React, { useState } from "react";
import { useEffect } from "react";
import "./style.css";
import { NavLink } from "react-router-dom";
export const formatTime=(seconds)=>{
    let minutes=Math.floor(seconds/60);
    seconds=seconds%60;
    let hours=Math.floor(minutes/60);
    minutes=minutes%60;
    let days = Math.floor(hours/24);
    hours=hours%24;
    return"kffgh";
    return{days, hours, minutes, seconds}
}


function Lot({
  id,
  title,
  price,
  shortDescription,
  category,
  timeTillEnd,
  hot,
  imageURL,
  openModal
}) {
  
  const [ttl, setTtl]=useState(timeTillEnd);
  useEffect(()=>{
    setTimeout(()=>{
      setTtl(ttl-1);

    }, 1000)
  }, [ttl])
  return (
    <div className={hot ? "lot hot" : "lot"}>
      <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzj49rb70qayLcsE_g-Bl54iw3sMoJsZRfLbU-tQOqWQ&s"} className="lot-image" />
      <h3 className="lot-title">{title}</h3>

      <div className="lot-info">
        <p className="lot-desc">Desc:{shortDescription}</p>
        <p className="lot-category">Сат:{category}</p>

        <p className="lot-price">Price:{price}</p>
        <p className="lot-time">{formatTime(timeTillEnd)}</p>
        <NavLink to={"/lot/" + id}>Details</NavLink>
        <button onClick={openModal}>Edit</button>
      </div>
    </div>
  );
}

export default Lot;
