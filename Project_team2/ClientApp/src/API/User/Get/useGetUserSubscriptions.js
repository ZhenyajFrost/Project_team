import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT} from '../../apiConstant';
import { getLocalStorage } from '../../../utils/localStorage';

const useGetUserSubscriptions = () => {
    const token = getLocalStorage('token');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [likedUsers, setLikedUsers] = useState([]);

    const getUserSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${EDIT_USER_ENDPOINT}/likedUsers?token=${token}`);
            console.log('User Subscriptions successfully retrieved: ', response.data);
            setLikedUsers(response.data)
        } catch (error) {
            console.error('Getting User Subscriptions failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getUserSubscriptions, likedUsers, isLoading, error ];
};

export default useGetUserSubscriptions;
