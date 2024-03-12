import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../apiConstant';

const useGetUnapprovedLots = () => {
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [lots, setLots] = useState([]);
    const [totalCount, setTotalCount] = useState();

    const getLots = async (token) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/getUnapprovedLots`, { token: token });

            console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data);
            //setTotalCount(response.data.totalCount)
        } catch (error) {
            console.error('Getting lots failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getLots, lots, totalCount, isLoading, error];
};

export default useGetUnapprovedLots;
