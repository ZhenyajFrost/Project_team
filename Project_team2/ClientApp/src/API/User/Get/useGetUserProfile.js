import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT} from '../../apiConstant';

const useGetUserProfile = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lot, setLot] = useState({});
    const [user, setUser] = useState({});

    const getUserProfile = async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${EDIT_USER_ENDPOINT}/getUserProfile?userId=${userId}`);
            console.log('User successfully retrieved: ', response.data);
            setUser(response.data)
        } catch (error) {
            console.error('Getting user failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getUserProfile, user, isLoading, error ];
};

export default useGetUserProfile;
