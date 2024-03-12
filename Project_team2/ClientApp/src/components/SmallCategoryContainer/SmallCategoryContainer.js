import React from 'react';
import "./style.css"

function CategoryContainer({categories, onCategoryChange, selectedCategorie}) {
    return (
        <div className='categoriesContainer'>
            {categories.map(v=>
                <div className={((v===selectedCategorie)?"selected ":"")+"category-item-container"} onClick={()=>onCategoryChange(v)}>{v.title}</div>
            )}
        </div>
    );
}

export default CategoryContainer;