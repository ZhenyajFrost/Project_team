const fs = require('fs');

// Assuming `data` is your initial array of objects
const data = [
  {
    "level_1": 7400000000,
    "level_2": 7424400000,
    "level_3": 7424456400,
    "level_4": 7424456401,
    "object_category": "Село",
    "object_name": "КОРЧЕВ'Я",
    "object_code": 7424456401,
    "region": "ЧЕРНІГІВСЬКА ОБЛАСТЬ",
    "community": "РІПКИНСЬКИЙ РАЙОН"
  },
  {
    "level_1": 7400000000,
    "level_2": 7424400000,
    "level_3": 7424456400,
    "level_4": 7424456402,
    "object_category": "Село",
    "object_name": "ЛОПАТНІ",
    "object_code": 7424456402,
    "region": "ЧЕРНІГІВСЬКА ОБЛАСТЬ",
    "community": "РІПКИНСЬКИЙ РАЙОН"
  }
];

// Function to transform the data into the desired structure
function transformData(data) {
  const result = [];

  data.forEach(item => {
    let region = result.find(r => r.name === item.region);
    if (!region) {
      region = { name: item.region, cities: [] };
      result.push(region);
    }
    region.cities.push({ name: item.object_name });
  });

  return result;
}

// Transform the data
const transformedData = transformData(data);

// Write the transformed data to a new JSON file
fs.writeFile('transformedData.json', JSON.stringify(transformedData, null, 2), (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File successfully written.');
  }
});