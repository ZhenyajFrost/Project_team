import React from "react";
import svgDef from "../../images/status.svg";
import css from "./UserShortV2/UserShortV2.module.css";

function Reputation({ reputation: { imgId, value, amount } }) {
  return (
    <div className={`${css.status} ${css[imgId]}`}>
      <div>
        <svg>
          <use href={`${svgDef}#${imgId}`} />
        </svg>{" "}
        <h5>{`${value}`}</h5>
      </div>
      <p>Цей користувач зробив {amount} успішних продажів.</p>
    </div>
  );
}

export default Reputation;
