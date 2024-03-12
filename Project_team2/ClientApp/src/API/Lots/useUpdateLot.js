import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import { getLocalStorage } from '../../utils/localStorage';
import Notiflix from 'notiflix';

const useUpdateLot = () => {
    const token = getLocalStorage('token');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateLot = async (lot) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/updateLot`, {token, lot});

            Notiflix.Notify.success('Лот успішно оновленно')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не оновленно! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { updateLot, isLoading, error };
};

export default useUpdateLot;