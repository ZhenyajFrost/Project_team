import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../apiConstant';

const useGetLotsByUser = () => {
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [lots, setLots] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [categoriesCount, setCategories] = useState();

    const getLots = async (userId, pageNumber, pageSize, activeTab, filters) => { //FILTER
        setLoading(true);

        // let goodFilters = {};

        // // Assuming `filters` is an object that might have various properties including `category`
        // const { category, ...otherFilters } = filters;
        
        // if (category !== null) {
        //     // If category is not null, include it in goodFilters
        //     goodFilters = { category, ...otherFilters };
        // } else {
        //     // If category is null, exclude it from goodFilters
        //     goodFilters = { ...otherFilters };
        // }

        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getLotsByUser`, {
                params: {
                    userId: userId,
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    active: activeTab === 'active',
                    unactive: activeTab === 'unactive',
                    archive: activeTab === 'archive',
                    ...filters
                }
            }); //FILTER IS NEEDED
            console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data.lots);
            setTotalCount(response.data.totalCount)
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

export default useGetLotsByUser;
