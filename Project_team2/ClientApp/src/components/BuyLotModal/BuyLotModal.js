import React, { useState } from "react";
import css from "./style.module.css";
import { Notify } from "notiflix";
import useAddBid from "../../API/Lots/useAddBid";
import { getLocalStorage } from "../../utils/localStorage";

function BuyLotModal({lotId,  maxBid, minStep, minPrice }) {
  const token = getLocalStorage("token");
  const [price, setPrice] = useState(
    Math.max(minPrice, maxBid.price) + minStep
  );
  const [addBid, isLoading] = useAddBid();
  const buy = () => {
    if (price < Math.max(minPrice, maxBid.price) + minStep) {
      Notify.failure(
        `Ціна має бути вищою за теперішню(${Math.max(
          minPrice,
          maxBid.price
        )}) ціну щонайменше на мінімальну ціну кроку(${minStep})`
      );
    } else {
      addBid({lotId,bidAmount:price, token});
    }
  };
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
      <input
        value={price}
        onInput={(e) => {
          const num = Number(e.target.value);
          if (isNaN(num)) {
            Notify.warning("Будь ласка, введіть число");
          } else {
            setPrice(num);
          }
        }}
      />
      <div className={css.buyBtn} onClick={buy}>
        Залишити ставку
      </div>
    </div>
  );
}

export default BuyLotModal;
