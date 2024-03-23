import React, { useEffect, useState } from "react";
import Input from "../components/UI/Input/Input";
import CategorySelector from "../components/Genesis/CategorySelector/CategorySelector";
import MultiplePhotoSelector from "../components/Genesis/MultiplePhotoSelector/MultiplePhotoSelector";
import StatePicker from "../components/Genesis/StatePicker/StatePicker";
import LocationSelector from "../components/LocationSelector/LocationSelector";
import css from "../styles/Create.module.css";
import useCreateLot from "../API/Lots/useCreateLot";
import useUpdateLot from "../API/Lots/useUpdateLot";
import { Notify } from "notiflix";
import TimeSelector from "../components/Genesis/TimeSelector/TimeSelector";
import store from "../utils/Zustand/store";

export default function CreateLot({ data = {} }) {
  const initialState = {
    title: "",
    category: 0,
    timeTillEnd: 1,
    minPrice: 0,
    minStepPrice: 0,
    price: 10000000,
    isNew: true,
    imageURLs: [],
    region: {},
    city: {},
  };

  const [lot, setLot] = useState({ ...initialState, ...data });
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const create = useCreateLot().createLot;
  const update = useUpdateLot().updateLot;
  console.log(lot);

  useEffect(() => {
    const svd = store().user;
    if (svd) setUser(svd);
  }, []);
  const onInput = (e) => {
    const { name, value } = e.target ? e.target : e;

    if (name.includes("rice")) {
      if (Number(value) > 100000000) {
        Notify.failure("число не може перевищувати 100000000");
      } else {
        setLot({ ...lot, [name]: Number(value) });
      }
      return;
    }

    setLot({ ...lot, [name]: value });
  };
  const onSubmit = (e) => {
    e.preventDefault();

    for (let a of Object.keys(initialState)) {
      if (!lot[a] && a != "isNew") {
        Notify.failure(`поле ${a} не заповнене`);
        return;
      }
    }
    if (lot.shortDescription.length < 40) {
      Notify.failure("Опис має бути щонайменше 40 символів");
      return;
    }
    if (lot.imageURLs.length === 0) {
      Notify.failure("В лота має бути щонайменше 1 зображення");
      return;
    }
    if (lot.city) {
      lot.region = lot.region.label;
      lot.city = lot.city.label;
    }
    lot.userId = user.id;
    //lot.timeTillEnd = ` ${new Date(lot.timeTillEnd).valueOf()}`;
    lot.timeTillEnd = new Date(
      new Date().setDate(new Date().getDate() + Number(lot.timeTillEnd))
    ).toISOString().replace("Z", "");

    lot.category = lot.category.id;

    if (data.id) {
      const answ = {};
      for (let a of Object.keys(lot)) {
        if (lot[a] !== data[a] && lot[a] !== null && lot[a] !== undefined) {
          console.log(lot[a]);
          answ[a] = lot[a];
        }
      }
      update(lot.id, answ).then((v) => {
        Notify.success("Лот оновлено успішно");
        
        window.location.href = "/profile/lots";
        // setLot({});
      });
    } else {
      create(lot).then((v) => {
        Notify.success("Лот створено успішно");
        window.location.href = "/profile/lots";
      });
    }
  };
  return (
    <div>
      <h1>{data.id ? "Змінити оголошення" : "Створити оголошення"}</h1>
      <form className={css.createForm} onSubmit={onSubmit}>
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
            active={!data.title}
          />

          <p>Тривалість торгів</p>
          <TimeSelector
            onChange={(t) => {
              onInput({ name: "timeTillEnd", value: t });
            }}
            value={lot.timeTillEnd}
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
            name="shortDescription"
            onInput={onInput}
            value={lot.shortDescription}
            placeholder="Детальніше опишіть товар"
            className={css.desc}
          />
          {lot.shortDescription && lot.shortDescription.length < 40 ? (
            <p>Введіть щонайменше 40 символів</p>
          ) : null}

          <p>Стан</p>
          <StatePicker
            change={(e) => setLot({ ...lot, isNew: e })}
            current={lot.isNew}
          />
        </div>
        <div className={css.createSection}>
          <h2>Ціна</h2>
          <div className={css.priceCont}>
            <div>
              <p>Вкажіть Мінімальну Ціну</p>
              <span>
                <input
                  className={css.priceInp}
                  name="minPrice"
                  onInput={onInput}
                  value={lot.minPrice}
                  type="number"
                  placeHolder="1200"
                />
                Грн
              </span>
            </div>
            <div>
              <p>Вкажіть мінімальну суму для 1 кроку</p>
              <span>
                <input
                  className={css.priceInp}
                  name="minStepPrice"
                  onInput={onInput}
                  value={lot.minStepPrice}
                  type="number"
                  placeHolder="500"
                />
                Грн
              </span>
            </div>
            <div>
              <p>Вкажіть бажану Ціну за яку готові продати</p>
              <span>
                <input
                  className={css.priceInp}
                  name="price"
                  onInput={onInput}
                  value={lot.price}
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
            selectedCity={lot.city}
            handleOnClick={() => {''}}
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
              {data.id ? "Змінити" : "Опублікувати"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
