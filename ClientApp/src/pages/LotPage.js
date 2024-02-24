import React, { useState } from "react";
import PostService from "../components/PostService/PostService.js";
import css from "../styles/LotPage.module.css";
import Loader from "../components/Loader/Loader";
import LotPath from "../components/LotPath/LotPath";
import PictureCarousel from "../components/PictureCarousel/PictureCarousel";
import svg from "../images/svgDef.svg";
import { formatTime } from "../utils/formatTime";
import UserShort from "../components/UserShort/UserShort.js";

function LotPage() {
  const id =
    window.location.href.split("/")[window.location.href.split("/").length - 1];
  console.log(id);
  const [lot, setLot] = useState({
    id: "",
    title: null,
    price: 0,
    timeTillEnd: 0,
    hot: false,
  });
  useState(async () => {
    let res = await PostService.getById(id);
    console.log(res);
    setLot(res);
  }, [setLot]);
  console.log(lot);
  const lotInfo = {
    "Технічний статус": "несправний",
    Наявність: "в наявності",
    Місцезнаходження: "Волинь",
    Стан: "б/в",
  };
  const user = {
    name: "sigma mewing male",
    since: "вересень 1939",
    last: "10 січня",
    avatar:
      "https://i.kym-cdn.com/editorials/icons/original/000/006/374/looksmaxxing.jpg",
  };
  return (
    <div>
      <LotPath category={lot.category} name={lot.title} />
      <div className={css.cont}>
        <div className={css.left}>
          <div className={css.sideThing}>
            <PictureCarousel
              images={[
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJh3CWYgD6Ef_xBzfGGAPLgyHxxi_vNEto993EyZITNQ&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_yoXVqQfcb5B9P1nv3tJUs1PBZ520YK0nYARL81kt9w&s",
                "https://picsum.photos/200/300",
                "https://picsum.photos/200",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwik-MjBNo1c_YNUECZyXvMBEZ94-_Y7o2X1Xmbx5LWA&s",
              ]}
            />
            <h3>Description</h3>
            {lot.shortDescription}
            <hr />
            <div className={css.sides}>
              <div>Перегляди: {lot.views}</div>
              <div>Поскаржитись</div>
            </div>
          </div>
          <UserShort user={user} />
        </div>

        <div>
          <h2>{lot.title}</h2>
          <div className={css.splitContainer}>
            <div className={css.sides}>
              <p>Продавець: {lot.seller}</p>
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
            </div>
          </div>

          <div className={css.splitContainer}>
            <p>Детальніше про лот:</p>
            <div className={css.lotChars}>
              {Object.keys(lotInfo).map((v) => (
                <>
                  <span>{v}:</span>
                  <span>{lotInfo[v]}</span>
                </>
              ))}
            </div>
          </div>
          <div className={css.splitContainer}>
            <p>Способи доставки:</p>
            <PostService
              name={"Укрпошта"}
              price={15}
              time={"2-5"}
              img={
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ukrposhta-ua-icon.svg/1422px-Ukrposhta-ua-icon.svg.png"
              }
            />
            <PostService
              name={"Нова пошта"}
              price={50}
              time={"2-5"}
              img={
                "https://lavbottle.com.ua/wp-content/uploads/2017/02/logo-nova-poshta.png"
              }
            />
            <PostService
              name={"Нова пошта"}
              price={85}
              time={"1-2"}
              img={
                "https://lavbottle.com.ua/wp-content/uploads/2017/02/logo-nova-poshta.png"
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
}

export default LotPage;
