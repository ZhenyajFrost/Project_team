import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../apiConstant';

const useGetLotsByUser = () => {
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [lots, setLots] = useState([]);
    const [totalCount, setTotalCount] = useState();

    const getLots = async (userId, page, pageSize, activeTab, filters) => { //FILTER
        setLoading(true);
        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getLotsByUser`, {
                params:
                {
                    userId: userId,
                    page: page,
                    pageSize: pageSize,
                    activeTab: activeTab,
                    filters: filters
                }
            }); //FILTER IS NEEDED
            console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data.lots);
            setTotalCount(response.data.totalCount)
        } catch (error) {
            console.error('Getting lots failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getLots, lots, isLoading, error];
};

export default useGetLotsByUser;
