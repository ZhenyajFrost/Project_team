import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../apiConstant';

const useGetUserLots = (initLots=[]) => {
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [lots, setLots] = useState(initLots);
    const [totalCount, setTotalCount] = useState();
    const [categoriesCount, setCategories] = useState();

    const getLots = async (userId, pageNumber, pageSize, filters) => {
        setLoading(true);
        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getUserLots`, {
                params: {
                    userId: userId,
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    ...filters
                }
            });
            //console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data.userLots);
            setTotalCount(response.data.totalLotCount)
            setCategories(response.data.categoryCount)
        } catch (error) {
            console.error('Getting lots failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getLots, lots, totalCount, categoriesCount, isLoading, error];
};

export default useGetUserLots;
