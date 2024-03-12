import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';

const useUpdatePasswordToken = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updatePassword = async (token, oldPassword, newPassword) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-password-with-token`, {token, oldPassword, newPassword} );
            Notiflix.Notify.success('Пароль оновленно успішно')
        } catch (error) {
            Notiflix.Notify.failure(`Оновлення паролю з помилками! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
        } finally {
            setLoading(false);
        }
    };

    return [updatePassword, isLoading, error];
};

export default useUpdatePasswordToken;