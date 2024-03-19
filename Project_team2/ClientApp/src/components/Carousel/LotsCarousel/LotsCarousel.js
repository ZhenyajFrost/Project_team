import React, {useState, useEffect} from "react";
import Lot from "../../Lot/Lot";
import styles from "../Carousel.module.css";

function LotsCarousel({ lots, lotWidth = 600 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(()=>{
    console.log(currentIndex);
    if(currentIndex<0){
        setCurrentIndex(lots.length-1);
    }
    if(currentIndex>lots.length-1){
        setCurrentIndex(0);
    }
  }, [currentIndex])
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.buttons}>
          <button className={styles.prevBtn} onClick={()=>{setCurrentIndex(currentIndex-1)}}>
            &#10094;
          </button>
          <button className={styles.nextBtn} onClick={()=>{setCurrentIndex(currentIndex+1)}}>
            &#10095;
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "20px", transform:`translate(${-currentIndex*lotWidth}px,0)`, transition:"all ease 1s" }}>
        {lots.map((lot) => (
          <Lot
            key={lot.id}
            id={lot.id}
            title={lot.title}
            price={lot.price}
            shortDescription={lot.shortDescription}
            category={lot.category}
            timeTillEnd={lot.timeTillEnd}
            hot={lot.hot}
            imageURLs={lot.imageURLs}
            isAdmin={false}
            isApproved={lot.approved}
          />
        ))}
      </div>
    </div>
  );
}

export default LotsCarousel;
