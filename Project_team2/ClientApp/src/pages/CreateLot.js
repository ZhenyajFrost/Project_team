import React, { useEffect, useState } from "react";
import Input from "../components/UI/Input/Input";
import CategorySelector from "../components/Genesis/CategorySelector/CategorySelector";
import MultiplePhotoSelector from "../components/Genesis/MultiplePhotoSelector/MultiplePhotoSelector";
import StatePicker from "../components/Genesis/StatePicker/StatePicker";
import LocationSelector from "../components/LocationSelector/LocationSelector";
import { getLocalStorage } from "../utils/localStorage";
import css from "../styles/Create.module.css";
import useCreateLot from "../API/Lots/useCreateLot";
import { Notify } from "notiflix";
import TimeSelector from "../components/Genesis/TimeSelector/TimeSelector";

export default function CreateLot() {
  const initialState = {
    title: "",
    category: 0,
    ShortDescription: "",
    endOn: 0,
    minimalBid: 0,
    stepPrice: 0,
    sellOn: Infinity,
    state: "Нове",
    imageURLs: [],
    region: {},
    city: {},
  };

  const [lot, setLot] = useState({});
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const create = useCreateLot();

  useEffect(() => {
    const svd = getLocalStorage("user");
    if (svd) setUser(svd);
  }, []);
  const onInput = (e) => {
    const { name, value } = e.target ? e.target : e;
    setLot({ ...lot, [name]: value });
  };
  const onSubmit = (e) => {
    e.preventDefault();
    for (let a of Object.keys(initialState)) {
      if (!lot[a]) {
        Notify.failure(`поле ${a} не заповнене`);
        return;
      }
    }
    if (lot.ShortDescription.length < 40) {
      Notify.failure("Опис має бути щонайменше 40 символів");
    }
    if (lot.city) {
      lot.region = lot.region.label;
      lot.city = lot.city.label;
    }
    lot.userId = user.id;
    lot.timeTillEnd = lot.endOn;
    lot.category = lot.category.id;
    create.createLot(lot);
    //setLot({});
  };
  return (
    <div>
      <h1>Створити оголошення</h1>
      <form onSubmit={onSubmit} className={css.createForm}>
        <div className={css.createSection}>
          <h2>Опишіть у подробицях</h2>
          <p>Вкажіть назву</p>
          <Input
            placeHolder="Вкажіть назву вашого товару"
            name="title"
            onInput={onInput}
            value={lot.title}
          />

          <p>Вкажіть Категорію</p>
          <CategorySelector
            onCatChange={(c) => onInput({ name: "category", value: c })}
            selectedCat={lot.category}
          />

          <p>Тривалість торгів</p>
          <TimeSelector
            onChange={(t) => {
              const today = new Date();
              const endDate = new Date(
                today.setDate(today.getDate() + Number(t))
              );
              onInput({ name: "endOn", value: endDate });
            }}
            value = {lot.endOn}
          />
        </div>
        <div className={css.createSection}>
          <h2>Фото</h2>
          <span>
            Перше фото буде на обкладинці оголошення. Перетягніть фото, щоб
            змінити порядок.
          </span>
          <MultiplePhotoSelector
            photos={lot.imageURLs}
            setPhotos={(e) => {
              setLot({ ...lot, imageURLs: e });
            }}
          />
        </div>
        <div className={css.createSection}>
          <h2>Деталі про товар</h2>
          <p>Опис</p>
          <textarea
            name="ShortDescription"
            onInput={onInput}
            value={lot.ShortDescription}
            placeholder="Детальніше опишіть товар"
            className={css.desc}
          />
          {lot.ShortDescription && lot.ShortDescription.length < 40 ? (
            <p>Введіть щонайменше 40 символів</p>
          ) : null}

          <p>Стан</p>
          <StatePicker
            change={(e) => setLot({ ...lot, state: e })}
            current={lot.state}
          />
        </div>
        <div className={css.createSection}>
          <h2>Ціна</h2>
          <div className={css.priceCont}>
            <div>
              <p>Вкажіть Мінімальну Ціну</p>
              <span>
                <Input
                  className={css.priceInp}
                  name="minimalBid"
                  onInput={onInput}
                  value={lot.minimalBid}
                  type="number"
                  placeHolder="1200"
                />
                Грн
              </span>
            </div>
            <div>
              <p>Вкажіть мінімальну суму для 1 кроку</p>
              <span>
                <Input
                  className={css.priceInp}
                  name="stepPrice"
                  onInput={onInput}
                  value={lot.stepPrice}
                  type="number"
                  placeHolder="500"
                />
                Грн
              </span>
            </div>
            <div>
              <p>Вкажіть бажану Ціну за яку готові продати</p>
              <span>
                <Input
                  className={css.priceInp}
                  name="sellOn"
                  onInput={onInput}
                  value={lot.sellOn}
                  type="number"
                  placeHolder="1200"
                />
                Грн
              </span>
            </div>
          </div>
        </div>

        <div className={css.createSection}>
          <h2>Місцезнаходження</h2>
          <LocationSelector
            onRegionChange={(e) => onInput({ name: "region", value: e })}
            onCityChange={(e) => onInput({ name: "city", value: e })}
            selectedRegion={lot.region}
          />
        </div>
        <div className={css.createSection}>
          <h2>Ваші контактні дані</h2>
          <div>
            <span>
              <p>ПІБ</p>
              <Input
                value={user.firstName + " " + user.lastName}
                disabled={true}
              />
            </span>
            <span>
              <p>Email</p>
              <Input value={user.email} disabled={true} />
            </span>
          </div>
        </div>
        <div className={css.createSection}>
          <div className={css.fincont}>
            <button className={css.final} type="submit">
              Опублікувати
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
