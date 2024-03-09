import React, { useEffect, useState } from 'react'
import css from "./FilterCategory.module.css"
import Button from '../UI/Button/Button'
import PostService from '../../API/PostService';
import { useFetching } from '../../hooks/useFetching';

export default function FilterCategory({ categories, onChange, setCategoryClicked }) {
    const [quantityOfLots, setQuantityOfLots] = useState(32);
    const [activeCat, setActiveCat] = useState('');

    const handleCatClick = (e) => {
        setActiveCat(e.target.value);
    };

    useEffect(() => {
        onChange({ category: activeCat });
        setCategoryClicked(prev => !prev)
    }, [activeCat]);

    return (
        <div className={css.container}>
            <label>Категорії</label>
            <div className={css.btnContainer}>
                <Button value=''
                    className={`${css.btn} ${activeCat === '' ? '' : css.activeCat}`}
                    onClick={handleCatClick}>Усі категорії <div className={css.number}>{quantityOfLots}</div></Button>
                {categories.map(category => (
                    <Button
                        value={category.value}
                        className={`${css.btn} ${activeCat === category.value ? '' : css.activeCat}`}
                        onClick={handleCatClick}>{category.label} <div className={css.number}>{category.count}</div>
                    </Button>
                ))}
            </div>
        </div>
    )
}
