import { useState } from 'react';
import axios from 'axios';
import { AUTH_ENDPOINT, EDIT_USER_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useBanUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { unblockUser } = store();

    const banUser = async (email) => {
        setLoading(true);
        try {
            if (!store.getState().isBlocked) {
                const response = await axios.post(`${AUTH_ENDPOINT}/ban_mail`, { email });

                setTimeout(() => {
                    unblockUser();
                }, 1000 * 60 * 5);
            }

            Notiflix.Notify.info('Пошту заблоковано на 5 хв! Зачекайте')

        } catch (error) {
            Notiflix.Notify.failure(`Юзера не заблоковано! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [banUser, isLoading, error];
};

export default useBanUser;