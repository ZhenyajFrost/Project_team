import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';

const useUpdatePasswordToken = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updatePassword = async (token, oldPassword, newPassword) => {
        setLoading(true);

        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/update-password-with-token`, {token, oldPassword, newPassword} );
            console.log('Password successfully updated: ', response.data);
        } catch (error) {
            console.error('Updating lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [updatePassword, isLoading, error];
};

export default useUpdatePasswordToken;