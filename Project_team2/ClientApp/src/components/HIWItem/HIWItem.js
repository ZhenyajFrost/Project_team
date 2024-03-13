import React from 'react';
import css from './HIWItem.module.css'

export default function HIWItem({ item }) {

    return (
        <div className={css.item}>
            <div className={css.header}>
                <div className={css.round}>{item.id}</div>
                <div className={css.title}>{item.title}</div>
            </div>

            <ul className={css.points}>
                {item.points.map(point => {
                    return (
                        <li key={point.id} className={css.point}>
                            {point.text}
                        </li>)
                })}
            </ul>
        </div>
    )
}