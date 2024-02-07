import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useUpdateLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateLot = async (lot) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/updateLot`, lot);
            console.log('Lot successfully updated: ', response.data);
        } catch (error) {
            console.error('Updating lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { updateLot, isLoading, error };
};

export default useUpdateLot;