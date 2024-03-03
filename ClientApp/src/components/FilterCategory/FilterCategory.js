import React, { useEffect, useState } from 'react'
import css from "./FilterCategory.module.css"
import Button from '../UI/Button/Button'
import PostService from '../../API/PostService';
import { useFetching } from '../../hooks/useFetching';

export default function FilterCategory({ userId, pagination, categories, setLots }) {
    const [quantityOfLots, setQuantityOfLots] = useState(32);
    const [activeCat, setActiveCat] = useState('all');

    // useEffect(()=>{
    //     setLots(activeLots);
    // }, [activeLots]);

    const handleCatClick = async (e) => {
        setActiveCat(e.target.value);
        
        //WRITE LOGIC
        // const response = await PostService.getAll(7, 1);
        // const data = await response.json();
        // setActiveLots(data);

        await setLots(userId, pagination.page, pagination.pageSize);
    };

    return (
        <div className={css.container}>
            <label>Категорії</label>
            <div className={css.btnContainer}>
                <Button value='all'
                    className={`${css.btn} ${activeCat === 'all' ? '' : css.activeCat}`}
                    onClick={handleCatClick}>Усі категорії <div className={css.number}>{quantityOfLots}</div></Button>
                {categories.map(category => (
                    <Button
                        value={category.value}
                        className={`${css.btn} ${activeCat === category.value ? '' : css.activeCat}`}
                        onClick={handleCatClick}>{category.label} <div className={css.number}>{category.quantity}</div>
                    </Button>
                ))}
            </div>
        </div>
    )
}
