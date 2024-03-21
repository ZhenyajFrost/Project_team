import React, { useEffect, useState } from 'react'
import css from "./FilterCategory.module.css"
import Button from '../UI/Button/Button'

export default function FilterCategory({ totalCount, categories, onChange, setCategoryClicked, categoryClicked }) {

    const handleCatClick = (e) => {
        const activeCat = e.target

        onChange( activeCat.id === '' ? {category : null} : {value: activeCat.value, category: activeCat.id});
        setCategoryClicked( activeCat.id === '' ? {category : null} : {value: activeCat.value, category: activeCat.id});
    };

    return (
        <div className={css.container}>
            <label>Категорії</label>
            <div className={css.btnContainer}>
                <Button value=''
                    className={`${css.btn} ${!categoryClicked.value? '' : css.activeCat}`}
                    onClick={handleCatClick}>{"Усі категорії"}<div className={css.number}>{totalCount}</div></Button>
                {categories.map(category => (
                    <Button
                        value={category.value}
                        id={category.id}
                        className={`${css.btn} ${categoryClicked.value === category.value ? '' : css.activeCat}`}
                        onClick={handleCatClick}>{category.label} <div className={css.number}>{category.count}</div>
                    </Button>
                ))}
            </div>
        </div>
    )
}
