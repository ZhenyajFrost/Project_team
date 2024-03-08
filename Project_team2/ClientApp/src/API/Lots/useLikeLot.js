import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useLikeLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const likeLot = async (token, lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/toggleLike`, {token, lotId});
            console.log('Lot successfully liked: ', response.data);
        } catch (error) {
            console.error('liking lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ likeLot, isLoading, error ];
};

export default useLikeLot;