import React, { useState, useEffect } from "react";
import css from "./HowItWorks.module.css"
import Carousel from "../../components/Carousel/Carousel";
export const HowItWorks = () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]

    return (
        <div style={{display: "flex", flexDirection: "column", gap: "8vw"}}>
            <img src="..." className={css.img}></img>
            <Carousel items={items}>

            </Carousel>
        </div>
    );
};
