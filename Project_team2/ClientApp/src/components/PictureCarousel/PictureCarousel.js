import React, { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import css from "./style.module.css";
import svg from "../../images/svgDef.svg";

function PictureCarousel({ images }) {
  const [order, setOrder] = useState(images);
  const line = useRef(null);
  const lineHigh = useRef(null);

  const setTarget = (target) => {
    const pos = order.indexOf(target);
    const dist = order.length - pos - 1;
    if (dist < pos) {
        const moveBkwrd = (i) => {
            if (i <= dist) {
              prev();
              setTimeout(() => moveBkwrd(i + 1), (i+1)*750);
            }
          };
    
       
          moveBkwrd(0);
    } else {
      const moveFwrd = (i) => {
        if (i > 0) {
          next();
          setTimeout(() => moveFwrd(i - 1), 750);
        }
      };

   
        moveFwrd(pos);
      
    }
  };

  const next = () => {
    line.current.style.transition = "all 0.5s ease";
    line.current.style.transform = "translate(-400px, 0)";

    lineHigh.current.style.transition = "all 0.5s ease";
    lineHigh.current.style.transform = "translate(-1200px, 0)";
    setTimeout(() => {
      order.push(order.shift());
      setOrder([...order]);

      line.current.style.transition = "none";
      line.current.style.transform = "translate(-200px, 0)";

      lineHigh.current.style.transition = "none";
      lineHigh.current.style.transform = "translate(-600px, 0)";
    }, 500);
  };
  const prev = () => {
    line.current.style.transition = "all 0.5s ease";
    line.current.style.transform = "translate(0px, 0)";

    lineHigh.current.style.transition = "all 0.5s ease";
    lineHigh.current.style.transform = "translate(0px, 0)";
    setTimeout(() => {
      order.unshift(order.pop());
      setOrder([...order]);

      line.current.style.transition = "none";
      line.current.style.transform = "translate(-200px, 0)";

      lineHigh.current.style.transition = "none";
      lineHigh.current.style.transform = "translate(-600px, 0)";
    }, 500);
  };

  if (order.length <= 1) {
    return <img src={order[0]} alt="highlight" className={css.selectedImg} />;
  }
  return (
    <div className={css.carouselContainer}>
      <div className={css.roundHigh}>
        <div className={css.lineHigh} ref={lineHigh}>
          <img
            src={order[order.length - 1]}
            alt="highlight"
            className={css.selectedImg}
          />
          <img src={order[0]} alt="highlight" className={css.selectedImg} />
          <img src={order[1]} alt="highlight" className={css.selectedImg} />
        </div>
      </div>

      <div className={css.roundabout}>
        <div className={css.line} ref={line}>
          {order.map((v, i) => (
            <img
              key={nanoid()}
              src={v}
              alt="pic"
              onClick={() => setTarget(v)}
            />
          ))}
          <img src={order[0]} alt="pic" />
        </div>
      </div>
      <svg className={css.arrowRight} onClick={next}>
        <use href={`${svg}#arrow`} />
      </svg>
      <svg className={css.arrowLeft} onClick={prev}>
        <use href={`${svg}#arrow`} />
      </svg>
    </div>
  );
}

export default PictureCarousel;
