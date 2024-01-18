import React, { useState } from "react";
import "./style.css";
import { NavLink } from "react-router-dom";

function Lot({
  id,
  title,
  price,
  shortDescription,
  timeTillEnd,
  hot,
  imageURL,
  openModal
}) {

  return (
    <div className={hot ? "lot hot" : "lot"}>
      <img src={imageURL} className="lot-image" />
      <h3 className="lot-title">{title}</h3>

      <div className="lot-info">
        <p className="lot-desc">{shortDescription}</p>

        <p className="lot-price">{price}</p>
        <p className="lot-time">{timeTillEnd}</p>
        <NavLink to={"/lot/" + id}>Details</NavLink>
        <button onClick={openModal}>Edit</button>
      </div>
    </div>
  );
}

export default Lot;
