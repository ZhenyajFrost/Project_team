import React, { useState } from "react";
import categories from "../../../Data/categories.json";
import def from "../../../images/svgDef.svg";
import ModalWindow from "../../ModalWindow/ModalWindow";
import css from "./style.module.css"
import CategoryModal from "../CategoryModal/CategoryModal";

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
          <div onClick={() => setModal(true)} className={css.button}>Змінити</div>
        </div>
        <ModalWindow
          visible={modal}
          setVisible={setModal}
          children={
            <CategoryModal onSelect={(c)=>{onCatChange(c); setModal(false); }} categories={categories}/>
          }
        />
      </>
    );
  }
}

export default CategorySelector;
