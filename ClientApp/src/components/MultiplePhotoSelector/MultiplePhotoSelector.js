import React from "react";
import PhotoItem from "./PhotoItem";
import css from "./style.module.css";
function MultiplePhotoSelector({ photos, setPhotos }) {
  let disp = [];
  for (let i = 0; i < 10; i++) {
    if (photos[i]) {
      disp.push(photos[i]);
    } else {
      if ((photos[i - 1] && photos[i-1]!=="+") || i === 0) disp.push('+');
      else disp.push(null);
    }
  }

  const dispFin = disp.map((v, i) => (
    <PhotoItem
      photo={v}
      order={(e) => {

        if(e===0){
          return;
        }        
        if(i+e>=10){
          e=9
        }
        if(e-i<=-10){
          e=-9
        }
        const cop = []
        for(let j = 0; j<10; j++){
          if(j!==i){
            cop.push(photos[j]);
          }
          if(j===i+e){
            cop.push(v)
          }
        }
        if(cop.length<10){
          if(e>0){
            cop.push(v)
          }else{
            cop.unshift(v)
          }
        }
        setPhotos(cop)
      }}
      setPhoto={(p) =>
        setPhotos([...disp.slice(0, i), p, ...disp.slice(i + 1)])
      }
    />
  ));
  return <div className={css.container}>{dispFin}</div>;
}

export default MultiplePhotoSelector;
