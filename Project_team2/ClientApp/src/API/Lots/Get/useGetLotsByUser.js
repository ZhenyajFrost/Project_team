import React, { useState } from "react";
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../apiConstant';
import store from "../../../utils/Zustand/store";

const useGetLotsByUser = () => {
    const {token} = store
    const [isLoading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [lots, setLots] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [categoriesCount, setCategories] = useState();

    const getLots = async (pageNumber, pageSize, activeTab, filters) => { //FILTER
        setLoading(true);

        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/getLotsByUser`, {
                ...filters,
                token: token,
                pageNumber: pageNumber,
                pageSize: pageSize,
                active: activeTab === 'active',
                unactive: activeTab === 'unactive',
                archive: activeTab === 'archive',

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
