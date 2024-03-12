import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';


const useCreateLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createLot = async (lot) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/createLot`, lot);

            Notiflix.Notify.success('Лот успішно створенно')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не створенно! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { createLot, isLoading, error };
};

export default useCreateLot;
