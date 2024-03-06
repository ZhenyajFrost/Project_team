import React from 'react'
import classes from './BigCategoryItem.module.css'
import svg from '../../images/svgDef.svg'
import { NavLink } from 'reactstrap'

export default function BigCategoryItem({ title, imgId }) {
    return (
        <NavLink className={classes.item} href={`/search?category=${imgId}/`}>
                <svg>
                    <use href={`${svg}#${imgId}`}/>
                    </svg>
                <h4>{title}</h4>
        </NavLink>
    )
}