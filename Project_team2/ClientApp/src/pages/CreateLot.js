import React, { useEffect, useState } from "react";
import Input from "../components/UI/Input/Input";
import CategorySelector from "../components/Genesis/CategorySelector/CategorySelector";
import MultiplePhotoSelector from "../components/Genesis/MultiplePhotoSelector/MultiplePhotoSelector";
import StatePicker from "../components/Genesis/StatePicker/StatePicker";
import LocationSelector from "../components/LocationSelector/LocationSelector";
import { getLocalStorage } from "../utils/localStorage";
import css from "../styles/Create.module.css";
import useCreateLot from "../API/Lots/useCreateLot";
import useUpdateLot from "../API/Lots/useUpdateLot";
import { Notify } from "notiflix";
import TimeSelector from "../components/Genesis/TimeSelector/TimeSelector";

export default function CreateLot({data={}}) {
  const initialState = {
    title: "",
    category: 0,
    endOn: 1,
    minimalBid: 0,
    minStepPrice: 0,
    sellOn: Infinity,
    isNew: true,
    imageURLs: [],
    region: {},
    city: {},
    ...data
  };

  const [lot, setLot] = useState(initialState);
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const create =  useCreateLot().createLot;
  const update = useUpdateLot().updateLot ;
  console.log(lot);

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
    console.log(lot)
    for (let a of Object.keys(initialState)) {
      if (!lot[a]) {
        Notify.failure(`поле ${a} не заповнене`);
        return;
      }
    }
    if (lot.shortDescription.length < 40) {
      Notify.failure("Опис має бути щонайменше 40 символів");
      return;
    }
    if (lot.imageURLs.length ===0) {
      Notify.failure("В лота має бути щонайменше 1 зображення");
      return;
    }
    if (lot.city) {
      lot.region = lot.region.label;
      lot.city = lot.city.label;
    }
    lot.userId = user.id;
    lot.timeTillEnd = lot.endOn.toISOString().slice(0, 19).replace("T", " ");
    lot.category = lot.category.id;

    if(data.id){
      update(lot).then(v=>{
        Notify.success("Лот оновлено успішно")
        setLot({});
      });
    }else{
      create(lot).then(v=>{
        Notify.success("Лот створено успішно")
        setLot({});
      });
    }

  };
  return (
    <div>
      <h1>Створити оголошення</h1>
      <form  className={css.createForm} onSubmit={onSubmit}>
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
            <button className={css.final} type="submit" >
              {data.id ? "Змінити" : "Опублікувати"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
