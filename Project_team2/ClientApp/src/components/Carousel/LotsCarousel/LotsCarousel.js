import React, { useState, useEffect } from "react";
import Lot from "../../Lot/Lot";
import styles from "../Carousel.module.css";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";

function LotsCarousel({ userId, lots, lotWidth = 589 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (currentIndex < 0) {
      setCurrentIndex(lots.length - 1);
    }
    if (currentIndex > lots.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);
  const style = window.screen.width > 375 ? "basic" : "compact";
  return (
    <div>
      <div className={styles.lotheader}>
        <h2>Усі оголошення автора</h2>

        {style === "basic" ? (
          <div className={styles.buttons}>
            <button
              className={styles.prevBtn}
              onClick={() => {
                setCurrentIndex(currentIndex - 1);
              }}
            >
              &#10094;
            </button>
            <button
              className={styles.nextBtn}
              onClick={() => {
                setCurrentIndex(currentIndex + 1);
              }}
            >
              &#10095;
            </button>
          </div>
        ) : (
          <NavLink to={`/user/${userId}`}>Показати всі</NavLink>
        )}
      </div>

      <div
        style={{
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            transform: `translate(${-currentIndex * lotWidth}px,0)`,
            transition: "all ease 1s",
            flexDirection: style === "compact" ? "column" : "row",
          }}
        >
          {lots.map((lot, i) =>
            style === "compact" && i > 0 ? null : (
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
                style={style}
                city={lot.city}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default LotsCarousel;
