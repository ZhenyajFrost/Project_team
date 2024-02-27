import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useGetLots = () => {
    const [isLoading, setLoading] = useState(false);
    
    const [error, setError] = useState(null);
    const [lots, setLots] = useState([]);

    const getLots = async (filters, pagination) => {
        setLoading(true);
        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getAllLots`, { filters, pagination }); //FILTER IS NEEDED
            console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data);
        } catch (error) {
            console.error('Getting lots failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ getLots, lots, isLoading, error ];
};

export default useGetLots;
