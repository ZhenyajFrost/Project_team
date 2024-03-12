import { useState } from 'react';
import axios from 'axios';
import { BIDS_ENDPOINT } from '../../apiConstant';
import { Notify } from 'notiflix';

const useGetLotsHistory= () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState({});

    const getHistory = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BIDS_ENDPOINT}/getRecentBids/${lotId}`);  
            Notify.failure(response.data)          
            setHistory(response.data); 
        } catch (error) {
            Notify.failure(error)   
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getHistory, history, isLoading, error ];
};

export default useGetLotsHistory;