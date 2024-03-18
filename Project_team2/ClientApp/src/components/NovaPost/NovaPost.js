import React, { useEffect, useState } from 'react';
import CustomSelect from '../Selector/Selector'; // Ensure this path is correct
import useGetCities from '../../API/NovaPost/Get/useGetCities';
import useGetDivisions from '../../API/NovaPost/Get/useGetDivisions';
import css from './NovaPost.module.css'
import Input from '../UI/Input/Input';

const NovaPost = ({ post = 'nova', onDeliveryChange }) => {
    const [delivery, setDelivery] = useState({
        city: '',
        area: '',
        region: null,
        index: '',
        deliveryService: ''
    });

    const [getCities, settlements, isLoading, error] = useGetCities();
    const [getDivisions, divisions, isLoadingDev] = useGetDivisions();

    const [settlementsOptions, setSettlementsOptions] = useState([]);
    const [selectedSettlement, setSelectedSettlement] = useState({});
    const [index, setIndex] = useState('');


    const [divisionsOptions, setDivisionsOptions] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState({});

    const [inputSet, setInputSet] = useState("");
    const [inputDiv, setInputDiv] = useState("");

    useEffect(() => {
        if (inputSet.length > 1) {
            const loadOptions = async () => {
                await getCities(inputSet);
            };
            loadOptions();
        }
    }, [inputSet]);

    useEffect(() => {
        if (inputSet.length > 1) {
            const loadOptions = async () => {
                await getDivisions(selectedSettlement.value, inputDiv);
            };
            loadOptions();
        }
    }, [inputDiv]);

    useEffect(() => {
        const options = settlements.map(set => ({
            label: `${set.settlementName} ${set.regionName} ${set.areaName}`,
            value: set,
        }));
        setSettlementsOptions(options);
    }, [settlements]);

    useEffect(() => {
        const options = divisions.map(div => ({
            label: `${div.name}`,
            value: div,
        }));
        setDivisionsOptions(options);
    }, [divisions]);

    useEffect(() => {
        const loadOptions = async () => {
            await getDivisions(selectedSettlement);
        };
        loadOptions();


        if (selectedSettlement.value) {
            setDelivery(prev => ({
                ...prev,
                city: selectedSettlement.value.settlementName,
                area: selectedSettlement.value.areaName !== null ? selectedSettlement.value.areaName : `${selectedSettlement.value.settlementName}cький район`,
                region: selectedSettlement.value.regionName,
                index: ''
            }))
        }

    }, [selectedSettlement])

    useEffect(() => {
        onDeliveryChange(delivery)
    }, [delivery])

    const handleSelectCity = (selectedOption) => {
        setSelectedSettlement(selectedOption);
    };

    const handleSelectDivision = (selectedOption) => {
        setSelectedDivision(selectedOption);
        setDelivery(prev => ({
            ...prev,
            index: selectedOption.label,
            deliveryService: 'NovaPost'
        }))
    };

    const handleInputChange = (newValue) => {
        setInputSet(newValue);
        return newValue;
    };

    const handleDivChange = (newValue) => {
        setInputDiv(newValue);
        return newValue;
    };

    const handleIndexChange = (event) => {
        setIndex(event.target.value);
        setDelivery(prev => ({
            ...prev, 
            index: event.target.value,
            deliveryService: 'UkrPost'
        }))
    };

    return (
        <div className={css.container}>
            <CustomSelect
                options={settlementsOptions}
                placeholder="Оберіть місто"
                onChange={handleSelectCity}
                onInputChange={handleInputChange}
                isSearchable={true}
                noOptionsMessage={() => "Місто не знайдено"}
                isLoading={isLoading}
            />

            {selectedSettlement && post !== 'ukr' ?
                <CustomSelect
                    options={divisionsOptions}
                    placeholder={selectedSettlement.value ? "Оберіть відділення або поштомат" : "Спочатку оберіть місто"}
                    onChange={handleSelectDivision}
                    onInputChange={handleDivChange}
                    isSearchable={true}
                    noOptionsMessage={() => "Відділення не знайдено"}
                    isLoading={isLoading}
                />
                :
                <Input
                    type="number"
                    id="index"
                    name="index"
                    placeholder="Введіть індекс"
                    value={index}
                    onChange={handleIndexChange}
                    required
                    style={{ height: "41px" }}
                />}
        </div>
    );
};

export default NovaPost;
