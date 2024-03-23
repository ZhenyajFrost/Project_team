import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useReportLot = () => {
    const token = store.getState().token
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportLot = async (lotId, reportText) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/reportLot`, {lotId, reportText, token});
            Notiflix.Notify.success('На лот успішно написано скаргу')
        } catch (error) {
            Notiflix.Notify.failure(`На лот не написано скаргу! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [reportLot, isLoading, error];
};

export default useReportLot;