import React, { useState } from "react";
import css from "../../styles/LotPage.module.css";
import style from "./style.module.css";
import { Notify } from "notiflix";
import usePlaceBid from "../../API/Bids/usePlaceBid";
import { getLocalStorage } from "../../utils/localStorage";
import useFastBuy from "../../API/Bids/useFastBuy";

function BuyLotModal({ userId, lotUserId, lotId, maxBid, minStep, minPrice, sellOn, killMyself }) {
  const token = getLocalStorage("token");
  const [price, setPrice] = useState(
    Math.max(minPrice, maxBid.price) + minStep
  );
  const handeBidOpt = (e)=>{
    setPrice(price+Number(e))
  }
  const [addBid, isLoading] = usePlaceBid();
  const [fastBuy, isLoadingFB, errorFB] = useFastBuy();

  const handleFastBuy = async () => {
    await fastBuy(lotId, sellOn, token);
  }
  
  
  const buy = () => {

    if(Number(userId) === Number(lotUserId)){
      Notify.failure('Ви не можете ставити ставку на свій лот((((')
      return;
    }
    if (price < Math.max(minPrice, maxBid.price) + minStep) {
      Notify.failure(
        `Ціна має бути вищою за теперішню(${Math.max(
          minPrice,
          maxBid.price
        )}) ціну щонайменше на мінімальну ціну кроку(${minStep})`
      );
    } else {
      addBid({ lotId, bidAmount: price, token });
    }
  };

  const bids = [minStep, minStep*5, minStep*10, minStep*50, minStep*100]
  return (
    <div className={style.main}>
      <h1 className={style.head}>Купити лот</h1>
      <div>
        <p className={css.priceTag}>Поточна ставка</p>
        <p className={css.price}>
          {maxBid.price === 0 ? minPrice : maxBid.price}₴
        </p>
      </div>
      <p>
        Наразі {maxBid.user ? `користувач: ${maxBid.user.login} перемагає` : "переможця немає"}
      </p>
      <hr />
      <p>Ставка</p>

      <div className={style.bidCont}>
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
      <div className={style.bidCont}>
          {bids.map(v=><div  className={style.bidOpt} onClick={()=>handeBidOpt(v)}>{v}</div>)}
          <div className={style.bidOpt + " " + style.noPlus} onClick={handleFastBuy}>Купити одразу</div>
      </div>
      <div className={style.suicide} onClick={killMyself}>x</div>
    </div>
  );
}

export default BuyLotModal;
