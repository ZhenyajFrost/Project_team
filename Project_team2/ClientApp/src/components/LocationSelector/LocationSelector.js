import React, { useState, useEffect } from "react";
import Select from "../Selector/Selector"; // Ensure this is the correct import path
import { State, City } from "country-state-city";
import css from "./LocationSelector.module.css";
import UAregions from "../../Data/regions.json";
import { transliterate } from "./transilt";

const LocationSelector = ({
  onRegionChange,
  onCityChange,
  selectedRegion,
  selectedCity,
}) => {
  const [statesOptions, setStatesOptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);
  if (selectedRegion && !selectedRegion.label) {
    let iso = UAregions.find((r) => r.name === selectedRegion);
    const c = State.getStatesOfCountry("UA").find(
      (s) => (iso && s.isoCode === iso.isoCode) || s.name === selectedRegion
    );
    if (c || iso) {
      const { name, isoCode } = iso? iso : UAregions.find((r) => r.isoCode === c.isoCode);
      onRegionChange({ label: name, value: isoCode });
    }
  }
  if (
    selectedRegion &&
    selectedRegion.value &&
    selectedCity &&
    !selectedCity.label
  ) {
    const r = City.getCitiesOfState("UA", selectedRegion.value).find(
      (s) => s.name === selectedCity || transliterate(s.name)===selectedCity
    );
    if (r) {
      const { name } = r;

      onCityChange({ label: transliterate(name), value: name });
    }
  }
  useEffect(() => {
    const statesData = State.getStatesOfCountry("UA").map((state) => ({
      value: state.isoCode,
      label: UAregions.find((r) => r.isoCode === state.isoCode).name,
    }));
    setStatesOptions(statesData);
    console.log(State.getStatesOfCountry("UA"));
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      const citiesData = City.getCitiesOfState("UA", selectedRegion.value).map(
        (city) => ({
          value: city.name,
          label: transliterate(city.name),
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
