import React from "react";
import PhotoItem from "./PhotoItem";
import css from "./style.module.css";
function MultiplePhotoSelector({ photos, setPhotos }) {
  let disp = [];
  const tidy = () => {
    let lastEmpty = -1;
    const cop = [...photos]
    for (let i = 0; i < 10; i++) {
      if (cop[i] === '+') {
        cop[i] = " ";
      }
      if (!cop[i] || cop[i] === "+" && lastEmpty === -1) {
        lastEmpty = i;
      } else {
        if (i !== 0 && (!cop[i] || cop[i] === "+")) {
          cop[lastEmpty] = cop[i]
          cop[i] = " ";
          lastEmpty++;

        }
      }
    }
    if (lastEmpty !== cop.length && !cop[lastEmpty])
      cop[lastEmpty] = "+";
    return cop
  }

  if (photos) {
    const cop=tidy();
    for (let i = 0; i < 10; i++) {
      if (cop[i]) {
        disp.push(cop[i]);
      }
    }
  } else {
    setPhotos([])
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
    />
  ));
  return <div className={css.container}>{dispFin}</div>;
}

export default MultiplePhotoSelector;
