import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../apiConstant';
import { setLocalStorage, getLocalStorage } from '../../utils/localStorage';

const useToggleNotification = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleNotification = async (userId, notification) => { //TOKEN
        const postUrl = `${EDIT_USER_ENDPOINT}/toggleNotifications${notification.charAt(0).toUpperCase() + notification.slice(1)}`;
        setLoading(true);

        try {
            const response = await axios.post(postUrl, {
                userId: userId
            });
            console.log(`Notification: ${notification} successfully updated: ${response.data}`);
        } catch (error) {
            console.error(`Updating ${notification} failed: ${error}`);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [toggleNotification, isLoading, error];
};

export default useToggleNotification;