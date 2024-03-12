import React, { useState } from 'react';
import styles from './Carousel.module.css'; // Import the CSS module

const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = 3;

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < items.length - visibleItems ? prevIndex + 1 : prevIndex
    );
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  return (
    <div className={styles.carouselContainer}>
      <div
        className={styles.carouselSlide}
        style={{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className={styles.carouselItem}>
            {item}
          </div>
        ))}
      </div>
      {currentIndex > 0 && <button className={styles.prevBtn} onClick={prev}>&#10094;</button>}
      {currentIndex < items.length - visibleItems && (
        <button className={styles.nextBtn} onClick={next}>&#10095;</button>
      )}
    </div>
  );
};

export default Carousel;
