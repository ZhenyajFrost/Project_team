import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';
import Notiflix from 'notiflix';

const useSubscribeUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const subscribeUser = async (token, userId) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/toggleSubscription`, {token, subscribedToId: userId});

            const user = getLocalStorage('user');
            let updatedLikedUsers = [];

            if (user.likedUsers.includes(userId)) {
                updatedLikedUsers = user.likedUsers.filter(id => id !== userId);
            } else {
                updatedLikedUsers = [...user.likedUsers, userId];
            }

            setLocalStorage('user', {
                ...user,
                likedUsers: updatedLikedUsers
            });

            Notiflix.Notify.success('На користувача успішно підписано')
        } catch (error) {
            Notiflix.Notify.failure(`На користувача не підписано! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ subscribeUser, isLoading, error ];
};

export default useSubscribeUser;