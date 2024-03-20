import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../../API/apiConstant';
import { setLocalStorage, getLocalStorage } from '../../../utils/localStorage';
import Notiflix from 'notiflix';

const useArchiveLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const archiveLot = async (token, lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/archiveLot`, {token, lotId});

            Notiflix.Notify.success('Лот успішно переміщено до архіву')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не переміщено до архіву! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ archiveLot, isLoading, error ];
};

export default useArchiveLot;