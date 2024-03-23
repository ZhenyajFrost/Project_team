import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useUpdateUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {updateUser:upd} = store();
    const updateUser = async (token, fieldsToUpdate) => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-user`, {token, fieldsToUpdate});
            upd(fieldsToUpdate)
            // setLocalStorage('user', {
            //     ...getLocalStorage('user'),
            //     ...fieldsToUpdate
            // })
            Notiflix.Notify.success('Юзера оновленно успішно')
        } catch (error) {
            Notiflix.Notify.failure(`Оновлення юзера з помилками! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
        } finally {
            setLoading(false);
        }
    };

    return [ updateUser, isLoading, error ];
};

export default useUpdateUser;