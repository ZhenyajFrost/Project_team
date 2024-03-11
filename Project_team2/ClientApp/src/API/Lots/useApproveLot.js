import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useApproveLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const approveLot = async (lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/approveLot`, lotId);
            console.log('Lot successfully approved: ', response.data);
        } catch (error) {
            console.error('approving lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ approveLot, isLoading, error ];
};

export default useApproveLot;