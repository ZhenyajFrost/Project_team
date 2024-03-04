import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';


const useCreateLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createLot = async (lot) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/createLot`, lot);
            console.log('Lot successfully created: ', response.data);
        } catch (error) {
            console.error('Creating lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { createLot, isLoading, error };
};

export default useCreateLot;
