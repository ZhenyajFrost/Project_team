import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';

const useDenyLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const denyLot = async (token, lotId, explanation) => {
        setLoading(true);
        
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/denyLot`,{token, lotId, explanation}, );
            Notiflix.Notify.success('Лот підтвердженно')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не підтвердженно! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [denyLot, isLoading, error];
};

export default useDenyLot;