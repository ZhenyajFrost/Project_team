import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';

const useLikeLot = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const likeLot = async (token, lotId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/toggleLike`, {token, lotId});
            console.log('Lot successfully liked: ', response.data);

            const user = getLocalStorage('user');
            let updatedLikedLotIds = [];

            if (user.likedLotIds.includes(lotId)) {
                updatedLikedLotIds = user.likedLotIds.filter(id => id !== lotId);
            } else {
                updatedLikedLotIds = [...user.likedLotIds, lotId];
            }

            setLocalStorage('user', {
                ...user,
                likedLotIds: updatedLikedLotIds
            });

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