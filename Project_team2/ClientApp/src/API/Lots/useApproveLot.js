import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';

const useApproveLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const approveLot = async (lotId, token) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/ApproveLot?id=${lotId}`, {lotId, token});
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

    return [approveLot, isLoading, error];
};

export default useApproveLot;