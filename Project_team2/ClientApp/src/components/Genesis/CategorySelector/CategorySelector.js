import React, { useState } from "react";
import categories from "../../../Data/categories.json";
import def from "../../../images/svgDef.svg";
import ModalWindow from "../../ModalWindow/ModalWindow";
import css from "./style.module.css";
import CategoryModal from "../CategoryModal/CategoryModal";

function CategorySelector({ selectedCat, onCatChange, active }) {
  const [modal, setModal] = useState(false);

  if (!selectedCat) {
    onCatChange(categories[0]);
    return null;
  } else {
    if (!selectedCat.title) {
      selectedCat = categories.find(
        (v) => Number(v.id) === Number(selectedCat)
      );
    }
    return (
      <>
        <div className={css.mainCont}>
          <div className={css.catCont}>
            <svg>
              <use href={`${def}#${selectedCat.imgId}`} />
            </svg>
            <p>{selectedCat.title}</p>
          </div>
          {active ? (
            <div onClick={() => setModal(active)} className={css.button}>
              Змінити
            </div>
          ) : null}
        </div>
        <ModalWindow
          visible={modal}
          setVisible={setModal}
          children={
            <CategoryModal
              onSelect={(c) => {
                onCatChange(c);
                setModal(false);
              }}
              categories={categories}
            />
          }
        />
      </>
    );
  }
}

export default CategorySelector;
