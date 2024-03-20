import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT } from '../../apiConstant';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const useGetUserProfile = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lot, setLot] = useState({});
    const [user, setUser] = useState({});

    const history = useHistory();

    const getUserProfile = async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${EDIT_USER_ENDPOINT}/getUserProfile?userId=${userId}`);
            console.log(response);

            console.log('User successfully retrieved: ', response.data);
            if (response.status === 404) {
                history.push('/404');
                return

            }

            setUser(response.data)
        } catch (error) {
            console.error('Getting user failed: ', error);

            if (error.response.status === 404) {
                history.push('/404');
                return
            }

            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getUserProfile, user, isLoading, error];
};

export default useGetUserProfile;
