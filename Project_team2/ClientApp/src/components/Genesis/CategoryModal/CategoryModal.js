import React from "react";
import def from "../../../images/svgDef.svg";
import css from "./style.module.css"

function CategoryModal({ categories, onSelect }) {
  return (
    <div className={css.container}>
      {categories.map((selectedCat) => (
        <div className={css.item} onClick={()=>onSelect(selectedCat)}>
          <svg>
            <use href={`${def}#${selectedCat.imgId}`} />
          </svg>
          <p>{selectedCat.title}</p>
        </div>
      ))}
    </div>
  );
}

export default CategoryModal;
