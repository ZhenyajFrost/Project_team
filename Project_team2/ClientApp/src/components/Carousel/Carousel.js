import React, { useState, useEffect } from "react";
import styles from "./Carousel.module.css"; // Import the CSS module

const Carousel = ({ items, maxItems = 4, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = maxItems;

  const next = () => {
    console.log("dskdkdkkd");
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };
  useEffect(() => {
    if (currentIndex < 0) {
      setCurrentIndex(0);
    }
    if (currentIndex > maxItems-1) {
      setCurrentIndex(maxItems-1);
    }
  }, [currentIndex]);

  return (
    <div>
      <div className={styles.header}>
        <h2>{title}</h2>
        <div className={styles.buttons}>
          <button className={styles.prevBtn} onClick={prev}>
            &#10094;
          </button>
          <button className={styles.nextBtn} onClick={next}>
            &#10095;
          </button>
        </div>
      </div>
      <div className={styles.carouselContainer}>
        <div
          className={styles.carouselSlide}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div key={index} className={styles.carouselItem}>
              {item}
            </div>
          ))}
        </div>
        <div className={styles.shine}></div>
      </div>
    </div>
  );
};

export default Carousel;
