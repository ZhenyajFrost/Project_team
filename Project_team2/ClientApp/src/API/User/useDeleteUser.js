import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import Notiflix from 'notiflix';
import store from '../../utils/Zustand/store';

const useDeleteUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {setData} = store();
    const deleteUser = async (token) => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/delete-user`, {token});

            setData();

            Notiflix.Notify.success('Юзера успішно видалено')
        } catch (error) {
            Notiflix.Notify.failure(`Юзера не видалено! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ deleteUser, isLoading, error ];
};

export default useDeleteUser;