import React, { useState } from "react";
import PostService from "../API/PostService";
import css from "../styles/LotPage.module.css";
import Loader from "../components/Loader/Loader";
import LotPath from "../components/LotPath/LotPath";
import PictureCarousel from "../components/PictureCarousel/PictureCarousel";
import svg from "../images/svgDef.svg";
import { formatTime } from "../utils/formatTime";
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
  return (
    <div>
      <LotPath category={lot.category} name={lot.title} />
      <div className={css.cont}>
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
        <div>
          <h2>{lot.title}</h2>
          <div>
            <div className={css.sides}>
              <p>Продавець: {lot.seller}</p>
              <p>
                <svg>
                  <use href={`${svg}#schedule`} />
                </svg>
                {formatTime(lot.timeTillEnd)}
              </p>
            </div>
            <div> {lot.price} <div className={css.buyBtn}>Купити</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LotPage;
