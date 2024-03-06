import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';

const useDeleteUser = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteUser = async (token) => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/delete-user`, {token});
            console.log('User successfully updated: ', response.data);
            setLocalStorage('user', null);
            setLocalStorage('isLoggined', false);
            setLocalStorage('token', null)
        } catch (error) {
            console.error('Updating lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [ deleteUser, isLoading, error ];
};

export default useDeleteUser;