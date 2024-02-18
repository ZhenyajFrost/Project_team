import React, { useEffect, useState } from "react";
import Input from "../components/UI/Input/Input";
import CategorySelector from "../components/CategorySelector/CategorySelector";
import MultiplePhotoSelector from "../components/MultiplePhotoSelector/MultiplePhotoSelector";
import StatePicker from "../components/StatePicker/StatePicker";
import LocationSelector from "../components/LocationSelector/LocationSelector";
import { getLocalStorage } from "../utils/localStorage";
import css from "../styles/Create.module.css"

export default function CreateLot() {
  const [lot, setLot] = useState({
    title: "",
    description: "",
    endOn: new Date(),
    minimalBid: 0,
    sellOn: Infinity,
    images: [],
  });
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  useEffect(() => {
    const svd = getLocalStorage("user");
    if (svd) setUser(svd);
  }, []);
  const onInput = (e) => {
    const { name, value } = e.target;
    setLot({ ...lot, [name]: value });
  };
  const onSubmit = (e) => {
    e.preventDefault();
    console.log(lot);
    setLot({
      title: "",
      description: "",
      endOn: new Date(),
      minimalBid: 0,
      sellOn: Infinity,
      mainImage: "",
      images: [],
      category: "",
    });
  };
  return (
    <div>
      <h1>Створити оголошення</h1>
      <form onSubmit={onSubmit} className={css.createForm}>
        <div>
          <h2>Опишіть у подробицях</h2>
          <p>Вкажіть назву</p>
          <Input
            placeHolder="Вкажіть назву вашого товару"
            name="title"
            onInput={onInput}
            value={lot.title}
          />

          <p>Вкажіть Категорію</p>
          <CategorySelector onInput={onInput} />

          <p>Тривалість торгів</p>
          <span>
            Залишаю нотатку тому, хто побачить. Який вибір між к-стю днів має
            бути? На дизайні видно лише 3 дні, того я не знаю
          </span>
        </div>
        <div>
          <h2>Фото</h2>
          <span>
            Перше фото буде на обкладинці оголошення. Перетягніть фото, щоб
            змінити порядок.
          </span>
          <MultiplePhotoSelector />
        </div>
        <div>
          <h2>Деталі про товар</h2>
          <p>Опис</p>
          <textarea
            name="description"
            onInput={onInput}
            value={lot.description}
            placeholder="Детальніше опишіть товар"
          />
          {lot.description.length < 40 ? (
            <p>Введіть щонайменше 40 символів</p>
          ) : null}

          <p>Стан</p>
          <StatePicker />
        </div>
        <div>
          <h2>Ціна</h2>
          <div>
            <p>Вкажіть Мінімальну Ціну</p>
            <span>
              <Input
                name="minimalBid"
                onInput={onInput}
                value={lot.minimalBid}
                type="number"
                placeHolder="1200"
              />
              Грн
            </span>
            <p>Вкажіть мінімальну суму для 1 кроку</p>
            <span>
              <Input
                name="stepPrice"
                onInput={onInput}
                value={lot.stepPrice}
                type="number"
                placeHolder="500"
              />
              Грн
            </span>
            <p>Вкажіть бажану Ціну за яку готові продати</p>
            <span>
              <Input
                name="minimalBid"
                onInput={onInput}
                value={lot.minimalBid}
                type="number"
                placeHolder="1200"
              />
              Грн
            </span>
          </div>
        </div>

        <div>
          <h2>Місцезнаходження</h2>
          <LocationSelector />
        </div>
        <div>
          <h2>Ваші контактні дані</h2>
          <div>
            <span>
              <p>ПІБ</p>
              <Input value={user.firstName + " " + user.lastName} disabled={true}/>
            </span>
            <span>
              <p>Email</p>
              <Input value={user.email} disabled={true}/>
            </span>
          </div>
        </div>
        <div>
            <button type="submit">Опублікувати</button>
        </div>
      </form>
    </div>
  );
}
