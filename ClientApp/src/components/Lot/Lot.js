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
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <div className={hot ? "lot hot" : "lot"} onBlur={() => setEditing(false)}>
        <img src={imageURL} className="lot-image" />
        <input className="lot-title" defaultValue={title}/>

        <div className="lot-info">
          <input className="lot-desc" defaultValue={shortDescription} />

          <input className="lot-price" defaultValue={price}/>
          <input className="lot-time" defaultValue={timeTillEnd}/>
        </div>
      </div>
    );
  }
  return (
    <div className={hot ? "lot hot" : "lot"} onClick={() => setEditing(true)}>
      <img src={imageURL} className="lot-image" />
      <h3 className="lot-title">{title}</h3>

      <div className="lot-info">
        <p className="lot-desc">{shortDescription}</p>

        <p className="lot-price">{price}</p>
        <p className="lot-time">{timeTillEnd}</p>
        <NavLink to={"/lot/" + id}>Details</NavLink>
      </div>
    </div>
  );
}

export default Lot;
