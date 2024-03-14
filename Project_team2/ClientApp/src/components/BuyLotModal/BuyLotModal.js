import React from "react";
import css from "./style.module.css";

function BuyLotModal({ maxBid, minStep, minPrice }) {
  return (
    <div>
      <h1>Купити лот</h1>
      <div>
        <p className={css.priceTag}>Поточна ставка</p>
        <p className={css.price}>
          {maxBid.price === 0 ? minPrice : maxBid.price}₴
        </p>
      </div>
      <p>
        Наразі {maxBid.user ? `користувач: ${maxBid.user}` : "переможця немає"}
      </p>
      <hr />
      <p>Ставка</p>
      <input />
      <div className={css.buyBtn} onClick={() => {} }>
        Залишити ставку
      </div>
    </div>
  );
}

export default BuyLotModal;
