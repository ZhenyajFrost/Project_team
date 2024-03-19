import { useState } from 'react';
import axios from 'axios';
import { BIDS_ENDPOINT} from '../../apiConstant';
import { getLocalStorage } from '../../../utils/localStorage';

const useGetUserBids = () => {
    const token = getLocalStorage('token');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [bids, setBids] = useState([]); 
    const [totalCount, setTotalCount] = useState();

    const getUserBids = async (pagination, filters) => {
        setLoading(true);
        try {
            const response = await axios.post(`${BIDS_ENDPOINT}/getUserBids`,{
                token,
                page: pagination.page,
                pageSize: pagination.pageSize,
                ...filters
            });

            setBids(response.data.userBids);
            setTotalCount(response.data.totalRecords);
            console.log('User bids successfully retrieved: ', response.data.userBids);
        } catch (error) {
            console.error('Getting user bids failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getUserBids, bids, totalCount, isLoading, error ];
};

export default useGetUserBids;