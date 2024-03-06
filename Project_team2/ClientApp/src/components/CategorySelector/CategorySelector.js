import React, { useState } from "react";
import categories from "../../Data/categories.json";
import def from "../../images/svgDef.svg";
import ModalWindow from "../ModalWindow/ModalWindow";
import css from "./style.module.css"

function CategorySelector({ selectedCat, onCatChange }) {
  const [modal, setModal] = useState(false);
  if (!selectedCat) {
    onCatChange(categories[0]);
    return null;
  } else {
    return (
      <>
        <div className={css.mainCont}>
          <div className={css.catCont}>
            <svg>
              <use href={`${def}#${selectedCat.imgId}`} />
            </svg>
            <p>{selectedCat.title}</p>
          </div>
          <div onClick={() => setModal(true)}>Змінити</div>
        </div>
        <ModalWindow
          visible={modal}
          setVisible={setModal}
          children={
            <select
              onInput={(e) => {
                onCatChange(JSON.parse(e.target.value));
              }}
            >
              {categories.map((v) => (
                <option value={JSON.stringify(v)} key={v.imgId}>
                  {v.title}
                </option>
              ))}
            </select>
          }
        />
      </>
    );
  }
}

export default CategorySelector;
