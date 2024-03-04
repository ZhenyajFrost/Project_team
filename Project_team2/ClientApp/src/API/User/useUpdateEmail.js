import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';

const useUpdateEmail = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateEmail = async (token, fieldsToUpdate) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-email`, {token, currentEmail: fieldsToUpdate.currentEmail, newEmail: fieldsToUpdate.newEmail} );
            console.log('Email successfully updated: ', response.data);
        } catch (error) {
            console.error('Updating email failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [updateEmail, isLoading, error];
};

export default useUpdateEmail;