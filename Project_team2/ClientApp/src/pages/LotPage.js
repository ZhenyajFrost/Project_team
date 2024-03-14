﻿import React, { useState } from "react";
import PostServiceComponent from "../components/PostService/PostService.js";
import css from "../styles/LotPage.module.css";
import Loader from "../components/Loader/Loader";
import LotPath from "../components/LotPath/LotPath";
import PictureCarousel from "../components/PictureCarousel/PictureCarousel";
import svg from "../images/svgDef.svg";
import { formatTime } from "../utils/formatTime";
import UserShort from "../components/UserShort/UserShort.js";
import { nanoid } from "nanoid";
import useGetLotById from "../API/Lots/Get/useGetLotById.js";
import useGetLotsHistory from "../API/Lots/Get/useGetLotsHistory.js";
import { getLocalStorage } from "../utils/localStorage.js";
import LikeButton from '../components/UI/LikeButton/LikeButton.js'
import categories from "../Data/categories.json"

function LotPage() {
  const token = getLocalStorage('token');
  const id = parseInt(window.location.href.split("/").pop(), 10);

  
  let [getLotById, lot, user, isLoading, error,  ] = useGetLotById();
  let [getHistory, history] = useGetLotById();
  const cat = categories.find(categ => Number(categ.id) === Number(lot.category))
  useState(() => {
    // //change to data.lot
    // await getHistory(id);

    getLotById(id).then(v=>console.log(v));

  }, []);

  console.log(lot.title)
  if (!isLoading && !error) {
    const lotInfo = {
      Область: lot.region ? lot.region : "Невідоме",
      Місто: lot.city ? lot.city : "Невідоме",
      Стан: lot.isNew ? "Новий" : "б/у",
    };
    return (
      <div>
        <LotPath path={[{ name: cat ? cat.title : "Категорія", path: `/search?category=${lot.category}/` }, { name: lot.title, path: "" }]} />
        <div className={css.cont}>
          <div className={css.left}>
            <div className={css.sideThing}>
              <PictureCarousel
                images={lot.imageURLs}
              />
              <h3>Description</h3>
              {lot.shortDescription}
              <hr />
              <div className={css.sides}>
                <div>Перегляди: {lot.views}</div>
                <div>Поскаржитись</div>
              </div>
            </div>
            <div className={css.splitContainer}>
              <h2>Історія ставок</h2>
              {!history? history.map(v=><div>{JSON.stringify(v)}</div>):<h1>dd</h1>}
            </div>
            <UserShort user={user} />
          </div>

          <div>
            <h2>{lot.title}</h2>
            <div className={css.splitContainer}>
              <div className={css.sides}>
                <p>Продавець: {user.login}</p>
                <p>
                  <svg>
                    <use href={`${svg}#schedule`} />
                  </svg>
                  {formatTime(lot.timeTillEnd)}
                </p>
              </div>
              <hr />
              <div>
                {" "}
                {lot.price} <div className={css.buyBtn}>Купити</div>
                <LikeButton token={token} lotId={id} />
              </div>
            </div>

            <div className={css.splitContainer}>
              <p>Детальніше про лот:</p>
              <div className={css.lotChars}>
                {Object.keys(lotInfo).map((v) => (
                  <>
                    <span key={nanoid()}>{v}:</span>
                    <span key={nanoid()}>{lotInfo[v]}</span>
                  </>
                ))}
              </div>
            </div>
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
              <svg>
                <use href={`${svg}#deliveryTruck`} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  } else
    return <Loader />


}

export default LotPage;
