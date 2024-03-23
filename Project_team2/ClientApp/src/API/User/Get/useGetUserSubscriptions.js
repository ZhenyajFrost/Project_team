import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT} from '../../apiConstant';
import store from '../../../utils/Zustand/store';

const useGetUserSubscriptions = () => {
   const {token} = store();
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [likedUsers, setLikedUsers] = useState([]);

    const getUserSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/likedUsers`, {token});
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
