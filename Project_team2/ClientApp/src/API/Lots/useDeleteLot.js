import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import { getLocalStorage } from '../../utils/localStorage';
import Notiflix from 'notiflix';


const useDeleteLot = () => {
    const token = getLocalStorage('token')
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteLot = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/deleteLot`, { token, lotId });
            //window.location.reload();

            Notiflix.Notify.success('Лот успішно видалено')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не видалено! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { deleteLot, isLoading, error };
};

export default useDeleteLot;
