import React, { useState } from "react";
import PostService from "../API/PostService.js";
import PostServiceComponent from "../components/PostService/PostService.js";
import css from "../styles/LotPage.module.css";
import Loader from "../components/Loader/Loader";
import LotPath from "../components/LotPath/LotPath";
import PictureCarousel from "../components/PictureCarousel/PictureCarousel";
import svg from "../images/svgDef.svg";
import { formatTime } from "../utils/formatTime";
import UserShort from "../components/UserShort/UserShort.js";
import { nanoid } from "nanoid";
import useGetLotById from "../API/Lots/useGetLotById.js";
import { getLocalStorage } from "../utils/localStorage.js";
import LikeButton from '../components/UI/LikeButton/LikeButton.js'

function LotPage() {
  const token = getLocalStorage('token');
  const user = getLocalStorage('user');
  
  const id = parseInt(window.location.href.split("/").pop(), 10);
  console.log(id);


  // const [lot, setLot] = useState({
  //   id: "",
  //   title: null,
  //   price: 0,
  //   timeTillEnd: 0,
  //   hot: false,
  // });

  const [getLotById, lot, isLoading, error] = useGetLotById();

  useState(async () => {
    await getLotById(id);
  }, []);

  useState( () => {
    console.log(lot);
  }, [lot]);

  // useState(async () => {
  //   let res = await PostService.getById(id);
  //   console.log(res);
  //   setLot(res);
  // }, [setLot]);

  console.log(lot);
  const lotInfo = {
    "Технічний статус": "несправний",
    Наявність: "в наявності",
    Місцезнаходження: "Волинь",
    Стан: "б/в",
  };
  return (
    <div>
      <LotPath path={[{name:lot.category, path:`/search?category=${lot.category}/`},{name:lot.title, path:""}]} />
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
              <LikeButton token={token} lotId={id}/>
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
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ukrposhta-ua-icon.svg/1422px-Ukrposhta-ua-icon.svg.png"
              }
            />
            <PostServiceComponent
              name={"Нова пошта"}
              price={50}
              time={"2-5"}
              img={
                "https://lavbottle.com.ua/wp-content/uploads/2017/02/logo-nova-poshta.png"
              }
            />
            <PostServiceComponent
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
