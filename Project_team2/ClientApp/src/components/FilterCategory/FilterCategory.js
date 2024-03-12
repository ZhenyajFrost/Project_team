import React, { useEffect, useState } from 'react'
import css from "./FilterCategory.module.css"
import Button from '../UI/Button/Button'

export default function FilterCategory({ totalCount,categories, onChange, setCategoryClicked }) {
    const [quantityOfLots, setQuantityOfLots] = useState(32);
    const [activeCat, setActiveCat] = useState({value: ''});

    const handleCatClick = (e) => {
        setActiveCat(e.target);
    };

    useEffect(() => {
        onChange( activeCat.id === '' ? {category : null} : { category: activeCat.id});
        setCategoryClicked(prev => !prev)
    }, [activeCat]);

    return (
        <div className={css.container}>
            <label>Категорії</label>
            <div className={css.btnContainer}>
                <Button value=''
                    className={`${css.btn} ${activeCat.value === '' ? '' : css.activeCat}`}
                    onClick={handleCatClick}>Усі категорії <div className={css.number}>{totalCount}</div></Button>
                {categories.map(category => (
                    <Button
                        value={category.value}
                        id={category.id}
                        className={`${css.btn} ${activeCat.value === category.value ? '' : css.activeCat}`}
                        onClick={handleCatClick}>{category.label} <div className={css.number}>{category.count}</div>
                    </Button>
                ))}
            </div>
        </div>
    )
}
