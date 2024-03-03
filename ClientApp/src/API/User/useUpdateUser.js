import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';

const useUpdateUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateUser = async (token, fieldsToUpdate) => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-user`, {token, fieldsToUpdate});
            console.log('User successfully updated: ', response.data);
            setLocalStorage('user', {
                ...getLocalStorage('user'),
                ...fieldsToUpdate
            })
        } catch (error) {
            console.error('Updating lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ updateUser, isLoading, error ];
};

export default useUpdateUser;