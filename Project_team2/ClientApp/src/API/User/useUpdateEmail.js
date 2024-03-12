import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';
import Notiflix from 'notiflix';

const useUpdateEmail = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateEmail = async (token, fieldsToUpdate) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-email`, {token, password: fieldsToUpdate.password, currentEmail: fieldsToUpdate.currentEmail, newEmail: fieldsToUpdate.newEmail} );
            console.log('Email successfully updated: ', response.data);
            
            setLocalStorage('user', {
                ...getLocalStorage('user'),
                email: fieldsToUpdate.newEmail
            })
            Notiflix.Notify.success('Пошта успішно оновленна')
        } catch (error) {
            Notiflix.Notify.failure(`Пошта не оновленна! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [updateEmail, isLoading, error];
};

export default useUpdateEmail;