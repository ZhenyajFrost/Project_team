import React from "react";
import Lot from "../../Lot/Lot.js";
import LotSmall from "../../Lot/LotSmall/LotSmall.js"
import classes from "./LotContainer.module.css";

function LotContainer({ lots, display = "", lotStyle = "basic", isAdmin="false" }) {
  const displayClass = display ? classes[display] : '';
  const classString = `${classes.lotsContainer} ${displayClass}`;

  const renderLot = (lot, style) => {
    switch (style) {
      case "basic":
        return (
          <Lot
            key={lot.id}
            id={lot.id}
            title={lot.title}
            price={lot.price}
            shortDescription={lot.shortDescription}
            category={lot.category}
            timeTillEnd={lot.timeTillEnd}
            hot={lot.hot}
            city={lot.city}
            imageURLs={lot.imageURLs}
            isAdmin={isAdmin}
            isApproved={lot.approved}
            style={style}
          />
        );
      case "small":
        return (
          <LotSmall
            key={lot.id}
            id={lot.id}
            title={lot.title}
            price={lot.price}
            shortDescription={lot.shortDescription}
            timeTillEnd={lot.timeTillEnd}
            imageURLs={lot.imageURLs}
            location={lot.city}
            userId=  {lot.userId}
            status={ lot.active ? 'active' : lot.unactive ? 'unactive' : lot.archive ? 'archive' : ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classString}>
      {lots.map((lot) => renderLot(lot, lotStyle))}
    </div>
  );
}

export default LotContainer;
