 import categoriesData from "../Data/categories.json"
 
 export function categoriesFromCategoriesCount(countsObj) {

    if (typeof countsObj !== 'object' || countsObj == null) {
        return []; // Return an empty array if the input is invalid
      }
      
    return Object.keys(countsObj).map(key => {
        const category = categoriesData.find(category => category.id === parseInt(key));
        
        if (category) {
          return {
            id: category.id,
            value: category.imgId,
            label: category.title,
            count: countsObj[key]
          };
        }
        
        return undefined;
      }).filter(item => item !== undefined); 
 }