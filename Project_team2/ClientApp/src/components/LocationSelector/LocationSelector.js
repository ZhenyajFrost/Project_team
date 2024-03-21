import React, { useState, useEffect } from "react";
import Select from "../Selector/Selector"; // Ensure this is the correct import path
import { State, City } from "country-state-city";
import css from "./LocationSelector.module.css";
import UAregions from "../../Data/regions.json";
import regionCities from '../../Data/regionCities.json'
import { transliterate } from "./transilt";

const LocationSelector = ({
  onRegionChange,
  onCityChange,
  selectedRegion,
  selectedCity
}) => {
  const [statesOptions, setStatesOptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);

  useEffect(() => {

    const statesData = regionCities.map(region => ({
      value: region.name.toLowerCase(),
      label: region.name
    }));
    setStatesOptions(statesData);

  }, []);

  useEffect(() => {

    if (selectedRegion.value) {


      const selectedRegionValue = selectedRegion.value !== null ? selectedRegion.value.toLowerCase() : selectedRegion;

      const cities = regionCities.reduce((acc, region) => {
        if (region.name.toLowerCase() === selectedRegionValue) {
          acc.push(...region.cities);
        }
        return acc;
      }, []);

      console.log(cities.map((city) => ({
        value: city.name,
        label: city.name
      })));
      setCitiesOptions(cities.map((city) => ({
        value: city.name,
        label: city.name
      })));

    } else {
      setCitiesOptions([]);
    }
  }, [selectedRegion]);

  return (
    <div className={css.container}>
      <div className={css.item}>
        <label>Область:</label>
        <Select
          options={statesOptions}
          onChange={onRegionChange}
          value={selectedRegion}
          placeholder={selectedRegion ? selectedRegion : "Оберіть область"}
        />
      </div>
      <div className={css.item}>
        <label>Місто:</label>
        <Select
          options={citiesOptions}
          onChange={onCityChange}
          value={selectedCity}
          placeholder={selectedCity ? selectedCity : "Оберіть область"}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
