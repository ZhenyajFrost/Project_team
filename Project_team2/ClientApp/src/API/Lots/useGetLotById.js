import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useGetLotById = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lot, setLot] = useState({});

    const getLotById = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getLotById/${lotId}`);
            console.log('Lot successfully retrieved: ', response.data);
            setLot(response.data);
        } catch (error) {
            console.error('Getting lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getLotById, lot, isLoading, error ];
};

export default useGetLotById;
