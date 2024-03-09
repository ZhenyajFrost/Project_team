 import categoriesData from "../Data/categories.json"
 
 export function categoriesFromLots(lots) {
    const categoriesLookup = categoriesData.reduce((acc, category) => {
        acc[category.id] = { value: category.imgId, label: category.title, count: 0 };
        return acc;
    }, {});

    // Counting lots for each category
    lots.forEach(lot => {
        if (categoriesLookup.hasOwnProperty(lot.category)) {
            categoriesLookup[lot.category].count++;
        }
    });

    // Creating the final array, filtering out categories with no lots
    const categoriesWithCount = Object.entries(categoriesLookup)
        .filter(([_, category]) => category.count > 0)
        .map(([id, category]) => ({
            id: parseInt(id), // Convert the id back to integer
            ...category
        }));

    return categoriesWithCount;
 }