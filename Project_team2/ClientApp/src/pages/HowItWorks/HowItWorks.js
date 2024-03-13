import React, { useState, useEffect } from "react";
import css from "./HowItWorks.module.css"
import Carousel from "../../components/Carousel/Carousel";
import hiv from '../../Data/hiv.json'
import HIWItem from "../../components/HIWItem/HIWItem";
export const HowItWorks = () => {
    const items = hiv.map(item => {
        return <HIWItem item={item}/>
    }) 


    return (
        <div style={{display: "flex", flexDirection: "column", gap: "8vw"}}>
            <img src="..." className={css.img}></img>
            <Carousel items={items} title="Як це працює?">

            </Carousel>
        </div>
    );
};
