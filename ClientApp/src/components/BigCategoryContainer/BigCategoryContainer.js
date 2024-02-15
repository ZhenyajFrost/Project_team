import React from "react";
import BigCategoryItem from "../BigCategoryItem/BigCategoryItem"
import classes from "./BigCategoryContainer.module.css";
  
  function BigCategoryContainer({categories}) {
  
    return (
      <div>
      
        <div className={classes.container}>
          {categories.map((category, i) => (
            <BigCategoryItem
              id={category.id}
              title={category.title}
              imgId={category.imgId}
            />
          ))}
  
        </div>
      </div>
    );
  }
  
  export default BigCategoryContainer;