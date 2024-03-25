import React from "react";
import PhotoItem from "./PhotoItem";
import css from "./style.module.css";
function MultiplePhotoSelector({ photos, setPhotos }) {
  let disp = [];
  const tidy = () => {
    let lastEmpty = -1;
    const cop = [...photos];
    for (let i = 0; i < 10; i++) {
      if (cop.slice(0, i).includes(cop[i])) {
        cop[i] = "";
      }
      if (cop[i] === "+") {
        cop[i] = "";
      }
      if (!cop[i] || (cop[i] === "+" && lastEmpty === -1)) {
        lastEmpty = i;
      } else {
        if (i !== 0 && (!cop[i] || cop[i] === "+")) {
          cop[lastEmpty] = cop[i];
          cop[i] = " ";
          lastEmpty++;
        }
      }
    }
    for (let i = 0; i < 10; i++) {
      if (!cop[i]) {
        cop[i] = "+";
        return cop;
      }
    }
    return cop;
  };

  if (photos) {
    const cop = tidy();
    console.log(cop);
    for (let i = 0; i < 10; i++) {
      disp.push(cop[i]);
    }
    console.log(disp);
  } else {
    setPhotos([]);
  }

  const dispFin = disp.map((v, i) => (
    <PhotoItem
      photo={v}
      order={(e) => {
        if (e === 0) {
          return;
        }
        if (i + e >= 10) {
          e = 9;
        }
        if (e - i <= -10) {
          e = -9;
        }
        const cop = [];
        for (let j = 0; j < 10; j++) {
          if (j !== i) {
            cop.push(photos[j]);
          }
          if (j === i + e) {
            cop.push(v);
          }
        }
        if (cop.length < 10) {
          if (e > 0) {
            cop.push(v);
          } else {
            cop.unshift(v);
          }
        }
        setPhotos(cop);
      }}
      setPhoto={(p) =>
        setPhotos([...disp.slice(0, i), p, ...disp.slice(i + 1)])
      }
      kms={() => {
        console.log(photos.filter((ph, j) => ph !== v))
        setPhotos(photos.filter((ph, j) => ph !== v));
      }}
    />
  ));
  return <div className={css.container}>{dispFin}</div>;
}

export default MultiplePhotoSelector;
