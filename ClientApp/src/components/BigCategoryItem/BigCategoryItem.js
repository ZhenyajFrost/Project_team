import React from 'react'

export default function BigCategoryItem({ id, title, imgUrl }) {
    return (
        <div style={{position:"relative"}}>
            <img src={imgUrl} style={{position:"absolute", top:"24px", left:"24px", width:"24px", height:"24px"}} />
            <h3>{title}</h3>
        </div>
    )
}