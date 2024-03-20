import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../../API/apiConstant';
import { setLocalStorage, getLocalStorage } from '../../../utils/localStorage';
import Notiflix from 'notiflix';

const useUnactiveLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const unactiveLot = async (token, lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/unactiveLot`, {token, lotId});
            console.log('Lot successfully moved to Unactive: ', response.data);
            
            Notiflix.Notify.success('Лот успішно переміщено до неактивних')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не переміщено до неактивних! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ unactiveLot, isLoading, error ];
};

export default useUnactiveLot;