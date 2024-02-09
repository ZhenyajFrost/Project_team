import React from "react";
import BigCategoryItem from "../BigCategoryItem/BigCategoryItem"
import classes from "../UI/LotContainer/LotContainer.module.css";
  
  function BigCategoryContainer({ categories}) {
  
    return (
      <div>
      
        <div className={classes.lotsContainer + " " + classes.grid }>
          {categories.map((category, i) => (
            <BigCategoryItem
              id={category.id}
              title={category.title}
              imageURL={category.imageURL}
            />
          ))}
  
        </div>
      </div>
    );
  }
  
  export default BigCategoryContainer;