import React from 'react'
import "./style.css"
import { NavLink } from "react-router-dom";

function Lot({id, title, price, shortDescription, timeTillEnd, hot, imageURL }) {


    return (
        <NavLink to={"/lots/" + id} className={hot ? "lot hot" : "lot"}>
            <img src={imageURL} className="lot-image" />
            <h3 className="lot-title">{title}</h3>

            <div className="lot-info">

                <p className="lot-desc">{shortDescription}</p>

                <p className="lot-price">{price}</p>
                <p className="lot-time">{timeTillEnd}</p>
            </div>
            
        </ NavLink>
    )
}


export default Lot;