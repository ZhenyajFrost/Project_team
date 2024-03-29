import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useUpdateEmail = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {updateUser} = store();
    
    const updateEmail = async (token, fieldsToUpdate) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-email`, {token, password: fieldsToUpdate.password, currentEmail: fieldsToUpdate.currentEmail, newEmail: fieldsToUpdate.newEmail} );
            // console.log('Email successfully updated: ', response.data);
            
            updateUser({email:fieldsToUpdate.newEmail})
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