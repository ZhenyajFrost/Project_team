import React, { useState, useEffect } from "react";
import Select from "../Selector/Selector"; // Ensure this is the correct import path
import { State, City } from "country-state-city";
import css from "./LocationSelector.module.css";

const LocationSelector = ({
  onRegionChange,
  onCityChange,
  selectedRegion,
  selectedCity,
}) => {
  const [statesOptions, setStatesOptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);
  if (selectedRegion && !selectedRegion.label) {
    console.log(selectedRegion);
    const {name, isoCode} = State.getStatesOfCountry("UA").find((s) => s.name === selectedRegion)
    onRegionChange(
      {label:name, value:isoCode}
    );
  }
  if (selectedRegion && selectedCity && !selectedCity.label) {
    console.log(selectedCity);
    const v = City.getCitiesOfState("UA", selectedRegion.value).find((s) => s.name === selectedCity)
    onRegionChange(
      v
    );
  }
  useEffect(() => {
    const statesData = State.getStatesOfCountry("UA").map((state) => ({
      value: state.isoCode,
      label: state.name,
    }));
    setStatesOptions(statesData);
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      const citiesData = City.getCitiesOfState("UA", selectedRegion.value).map(
        (city) => ({
          value: city.name,
          label: city.name,
        })
      );
      setCitiesOptions(citiesData);
    } else {
      setCitiesOptions([]);
    }
  }, [selectedRegion]);

  return (
    <div className={css.container}>
      <div className={css.item}>
        <label>Область</label>
        <Select
          options={statesOptions}
          onChange={onRegionChange}
          value={selectedRegion}
          placeholder="Оберіть область"
          isClearable
        />
      </div>
      <div className={css.item}>
        <label>Місто</label>
        <Select
          options={citiesOptions}
          onChange={onCityChange}
          value={selectedCity}
          placeholder="Оберіть місто"
          isClearable
        />
      </div>
    </div>
  );
};

export default LocationSelector;
