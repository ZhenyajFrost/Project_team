import React from 'react';
import css from "./style.module.css"
import Button from '../UI/Button/Button';

function CategoryContainer({categories, onCategoryChange, selectedCategorie}) {
    return (
        <div className={css.categoriesContainer}>
            {categories.map(v=>
                <Button className={(v.id === selectedCategorie.id)? "" : css.selected} onClick={()=>onCategoryChange(v)}>{v.title}</Button>
            )}
        </div>
    );
}

export default CategoryContainer;