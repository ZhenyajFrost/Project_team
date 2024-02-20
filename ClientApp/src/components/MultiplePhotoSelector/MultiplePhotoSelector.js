import React from "react";
import PhotoItem from "./PhotoItem";
import css from "./style.module.css";
function MultiplePhotoSelector({ photos, setPhotos }) {
  let disp = [];
  for (let i = 0; i < 10; i++) {
    if (photos[i]) {
      disp.push(photos[i]);
    } else {
      if (photos[i - 1] || i===0) disp.push("+");
      else disp.push(null);
    }
  }
  
  const dispFin = disp.map((v, i) => <PhotoItem photo={v} setPhoto={(p)=>setPhotos([...disp.slice(0, i), p, ...disp.slice(i+1)])}/>);
  return <div className={css.container}>{dispFin}</div>;
}

export default MultiplePhotoSelector;
