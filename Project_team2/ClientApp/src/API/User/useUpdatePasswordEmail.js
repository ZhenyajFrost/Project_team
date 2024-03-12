import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';
import Notiflix from 'notiflix';

const useUpdatePasswordEmail = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updatePassword = async (email, newPassword) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-password-by-email`, {email, newPassword} );
            Notiflix.Notify.success('Пароль оновленно успішно')
        } catch (error) {
            Notiflix.Notify.failure(`Оновлення паролю з помилками! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [updatePassword, isLoading, error];
};

export default useUpdatePasswordEmail;