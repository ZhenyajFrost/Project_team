import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useDeleteLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteLot = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/deleteLot?id=${lotId}`);
            console.log('Lot successfully deleted: ', response.data);
            window.location.reload();
        } catch (error) {
            console.error('Deleting lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { deleteLot, isLoading, error };
};

export default useDeleteLot;
