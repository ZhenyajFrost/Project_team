import React, { useEffect, useState } from "react";
import PostServiceComponent from "../../components/PostService/PostService.js";
import css from "./LotPage.module.css";
import Loader from "../../components/Loader/Loader.js";
import PictureCarousel from "../../components/LotPage/PictureCarousel/PictureCarousel.js";
import svg from "../../images/svgDef.svg";
import { formatTime } from "../../utils/formatTime.js";
import UserShort from "../../components/UserShort/UserShort.js";
import { nanoid } from "nanoid";
import useGetLotById from "../../API/Lots/Get/useGetLotById.js";
import useGetLotsHistory from "../../API/Lots/Get/useGetLotsHistory.js";
import LikeButton from "../../components/UI/LikeButton/LikeButton.js";
import ModalWindow from "../../components/ModalWindow/ModalWindow.js";
import BuyLotModal from "../../components/LotPage/BuyLotModal/BuyLotModal.js";
import Bid from "../../components/Bid/Bid.js";
import useGetUserLots from "../../API/Lots/Get/useGetUserLots.js";

import { WS_BASE_URL } from "../../API/apiConstant.js";
import useBidUpdatesWebSocket from '../../API/useBidUpdatesWebSocket.js'; // Импортируем наш хук

import LotsCarousel from "../../components/Carousel/LotsCarousel/LotsCarousel.js";
import store from "../../utils/Zustand/store.js";
import Report from "../../components/Report/Report.js";
import Notiflix from "notiflix";

function LotPage() {

  const id = parseInt(window.location.href.split("/").pop(), 10);
  const { user: me, token, webSocketToken, connectWebSocket } = store();
  const [modal, setModal] = useState(false);
  const [report, setReport] = useState(false)
  const [getLotById, lot, user, maxBid, isLoading, error] = useGetLotById();
  const [getLots, lots, totalCount, catcount, isLoadingLots] = useGetUserLots("");
  let [getHistory, history] = useGetLotsHistory();

  useEffect(() => {
    getLotById(id, token);
    getHistory(id);

    connectWebSocket(webSocketToken, id);
    // const intervalId = setInterval(() => {
    //     getHistory(id);
    // }, 3000);

    // return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (Number(lot.userId) && !lots) getLots(Number(lot.userId), 1, 10);
  }, [lot, getLots, lots]);


  if (!error && !isLoading && !lot.id) {
    return <h1>Щось пішло не так, спробуйте ще раз</h1>
  }
  if (!isLoading && !error) {
    const lotInfo = {
      Область: lot.region ? lot.region : "Невідоме",
      Місто: lot.city ? lot.city : "Невідоме",
      Стан: lot.isNew ? "Новий" : "б/у",
    };

    return (
      <div className={css.big}>
        {/* <LotPath
          path={[
            {
              name: cat ? cat.title : "Категорія",
              path: `/search?category=${lot.category}/`,
            },
            { name: lot.title, path: "" },
          ]}
        /> */}
        {window.screen.width <= 768 ? <h2 style={{ marginLeft: "10px" }}>{lot.title}</h2> : null}
        <div className={css.cont}>
          <div className={css.left}>
            <div className={css.sideThing}>
              <PictureCarousel images={lot.imageURLs} />
              <h3>Description</h3>
              <div className={css.shortDesc}>{lot.shortDescription}</div>
              <hr />
              <div className={css.sides}>
                <div>Перегляди: {lot.views}</div>
                <div className={css.report} onClick={() => setReport(true)}>Поскаржитись</div>
              </div>
            </div>
            {window.screen.width <= 768 ? (
              <div className={css.splitContainer}>
                <div className={css.sides}>
                  <p>
                    {lot.winnerUserId
                      ? `Користувач ${maxBid.user.login} переміг`
                      : `Наразі 
                  ${maxBid.user
                        ? ` перемагає ${maxBid.user.login}`
                        : `переможця немає`
                      }`}
                  </p>
                  <p>
                    <svg>
                      <use href={`${svg}#schedule`} />
                    </svg>
                    {formatTime(
                      (new Date(lot.timeTillEnd) - new Date()) / 1000
                    )}
                  </p>
                </div>
                <hr />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div className={css.priceCont}>
                    <div>
                      <p className={css.priceTag}>Поточна ставка</p>
                      <p className={css.price}>
                        {maxBid.price === 0 ? lot.minPrice : maxBid.price}₴
                      </p>
                    </div>
                    {me ? (
                      maxBid &&
                        maxBid.user &&
                        Number(maxBid.user.id) === Number(me.id) ? (
                        "Не можна перебити свою ставку!"
                      ) : (
                        <div
                          className={css.buyBtn}
                          onClick={() => setModal(true)}
                        >
                          Залишити ставку
                        </div>
                      )
                    ) : (
                      <a href={"/lot/" + lot.id + "?modal=login"}>
                        Зареєструйтесь щоб розмістити ставку
                      </a>
                    )}
                  </div>

                  <LikeButton lotId={id} />
                </div>
              </div>
            ) : null}
            <div className={css.splitContainer}>
              <h2>Історія ставок</h2>
              {history ? (
                history.length ? (
                  history.map((v) => (
                    <Bid
                      user={v.userId}
                      amount={v.bidAmount}
                      time={v.bidTime}
                    />
                  ))
                ) : (
                  "Тут поки пусто, будьте першими, хто зробить ставку :)"
                )
              ) : (
                null
              )}
            </div>
          </div>

          <div className={css.rigthThing}>
            {window.screen.width > 768 ? <h2>{lot.title}</h2> : null}
            {window.screen.width > 768 ? (
              <div className={css.splitContainer}>
                <div className={css.sides}>
                  <p>
                    {lot.winnerUserId
                      ? `Користувач ${maxBid.user.login} переміг`
                      : `Наразі 
                  ${maxBid.user
                        ? `користувач: ${maxBid.user.login} перемагає`
                        : `переможця немає`
                      }`}
                  </p>
                  <p>
                    <svg>
                      <use href={`${svg}#schedule`} />
                    </svg>
                    {formatTime(
                      (new Date(lot.timeTillEnd) - new Date()) / 1000
                    )}
                  </p>
                </div>
                <hr />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div className={css.priceCont}>
                    <div>
                      <p className={css.priceTag}>Поточна ставка</p>
                      <p className={css.price}>
                        {maxBid.price === 0 ? lot.minPrice : maxBid.price}₴
                      </p>
                    </div>
                    {me ? (
                      maxBid &&
                        maxBid.user &&
                        Number(maxBid.user.id) === Number(me.id) ? (
                        "Не можна перебити свою ставку!"
                      ) : (
                        <div
                          className={css.buyBtn}
                          onClick={() => setModal(true)}
                        >
                          Залишити ставку
                        </div>
                      )
                    ) : (
                      <a href={"/lot/" + lot.id + "?modal=login"}>
                        Зареєструйтесь щоб розмістити ставку
                      </a>
                    )}
                  </div>

                  <LikeButton lotId={id} />
                </div>
              </div>
            ) : null}

            <div className={css.splitContainer}>
              <p>Детальніше про лот:</p>
              <div className={css.lotChars}>
                {Object.keys(lotInfo).map((v) => (
                  <div>
                    <span key={nanoid()}>{v}:</span>
                    <span
                      key={nanoid()}
                      style={{ textWrap: "nowrap", textAlign: "right" }}
                    >
                      {lotInfo[v]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* пошта */}
            <div className={css.splitContainer}>
              <p>Способи доставки:</p>
              <PostServiceComponent
                name={"Укрпошта"}
                price={15}
                time={"2-5"}
                img={
                  "https://s3-alpha-sig.figma.com/img/c0a4/7e3a/63ec072f2f1a87b19c620efc720d6b7d?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Ski-GVTkopsqiLenGcFRt5P3MUdQVLu9pSTRGE7f5elcMHn4a5sDuYn2CRuwRwMNR92qx7nQvPmgS49HxJHuu8Llw0HiRYVkEOxsWKkWPODHCAZO8GyAWlzDtwS3JO45-WFJohcaKI3gx6mYXnC~sch1Jmv0Xn0U6u3HeWD5FnU8bU71jLV1fNKWn-y2jJxyVyXfj43UhWCF5Mhtv0Uyv1ZkpAgCPzddmzsrSwjcGtKosvSBos2~bXdfsLaCnaNaww4nq-XaTQX-zveuk7CSI542~fKPYJmk4OT1e4nIjrB3x-429AHhaXVusgDe7-SghqJWIWCO7NlZXroRRzJcVg__"
                }
              />
              <PostServiceComponent
                name={"Нова пошта"}
                price={50}
                time={"2-5"}
                img={
                  "https://s3-alpha-sig.figma.com/img/3f56/2f10/2445b255ad95919afdd3966f7b41c157?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=O5x27DjajTpp9wiHwVGkGgLhbxwTf1t63bQeYQ-mxPEATTIV09hHVkUJ9noWCM2P0o-MGVXywJ3XN11Z-~CQaxRq1kzQZz~ntY~XGqhmqULFaFEsHdTj497VrrkIZrHs7YpAd1N6zCiOSrIfE9Iq-3siCZhiiEwAycZcA5jUFioWa6CYVFKY4n9ltnE8HRo6Ozr86nmCrjd7iTPEfrqiQ1RKPJpuicajpjyGqqwuIMRGswXcK5DGJOm5GNg7MJcXxnHv4PD~jFxFjaJgm5R9Z1TbuL2El0dwfUyOQ5x3La~i9udQqPlVfPq6rH~TBwSNcwiX0BJ5I8HWharhvJDlGw__"
                }
              />
              <PostServiceComponent
                name={"Нова пошта"}
                price={85}
                time={"1-2"}
                img={
                  "https://s3-alpha-sig.figma.com/img/3f56/2f10/2445b255ad95919afdd3966f7b41c157?Expires=1711324800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=O5x27DjajTpp9wiHwVGkGgLhbxwTf1t63bQeYQ-mxPEATTIV09hHVkUJ9noWCM2P0o-MGVXywJ3XN11Z-~CQaxRq1kzQZz~ntY~XGqhmqULFaFEsHdTj497VrrkIZrHs7YpAd1N6zCiOSrIfE9Iq-3siCZhiiEwAycZcA5jUFioWa6CYVFKY4n9ltnE8HRo6Ozr86nmCrjd7iTPEfrqiQ1RKPJpuicajpjyGqqwuIMRGswXcK5DGJOm5GNg7MJcXxnHv4PD~jFxFjaJgm5R9Z1TbuL2El0dwfUyOQ5x3La~i9udQqPlVfPq6rH~TBwSNcwiX0BJ5I8HWharhvJDlGw__"
                }
              />
            </div>
            <div className={css.splitContainer}>
              <p>Користувач</p>
              <UserShort user={user} />
            </div>
          </div>
        </div>
        <div>
          {isLoadingLots ? (
            <Loader />
          ) : lots.length > 1 ? (
            <LotsCarousel lots={lots.filter(v => v.id !== lot.id)} userId={user.id} />
          ) : (
            <h4>В цього користувача немає інших лотів</h4>
          )}
        </div>
        {modal ? (
          <ModalWindow
            visible={modal}
            setVisible={setModal}>
            <BuyLotModal
              userId={me.id}
              lotUserId={lot.userId}
              killMyself={() => setModal(false)}
              maxBid={maxBid}
              minStep={lot.minStepPrice}
              minPrice={lot.minPrice}
              lotId={lot.id}
              sellOn={lot.price} />
          </ModalWindow>

        ) : null}

        {report ? (
          me ? (
            <ModalWindow visible={report} setVisible={setReport}>
              <Report lotId={lot.id} />
            </ModalWindow>
          ) : (
            setReport(false),
            Notiflix.Notify.info("Увійдіть в акаунт")
          )
        ) : (
          <></>
        )}


      </div>
    );
  } else return <Loader />;
}

export default LotPage;
