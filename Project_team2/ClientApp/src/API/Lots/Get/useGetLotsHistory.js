import { useState } from 'react';
import axios from 'axios';
import { BIDS_ENDPOINT } from '../../apiConstant';


const useGetLotsHistory= () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState({});

    const getHistory = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BIDS_ENDPOINT}/getRecentBids/${lotId}`);          
            setHistory(response.data); 
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getHistory, history, isLoading, error, setHistory ];
};

export default useGetLotsHistory;