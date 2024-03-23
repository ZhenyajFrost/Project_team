import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useLikeLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const likeLot = async (token, lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/toggleLike`, {token, lotId});
            console.log('Lot successfully liked: ', response.data);

            const {user, updateUser} = store()
            let updatedLikedLotIds = [];

            if (user.likedLotIds.includes(lotId)) {
                updatedLikedLotIds = user.likedLotIds.filter(id => id !== lotId);
            } else {
                updatedLikedLotIds = [...user.likedLotIds, lotId];
            }

            updateUser( {
                likedLotIds: updatedLikedLotIds
            });

            Notiflix.Notify.success('Лот успішно вподобаєно')
        } catch (error) {
            Notiflix.Notify.failure(`Лот не вподобаєно! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ likeLot, isLoading, error ];
};

export default useLikeLot;