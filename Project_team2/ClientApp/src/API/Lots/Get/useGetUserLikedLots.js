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

    const getLots = async (page, pageSize) => { //FILTER
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/getUserLikedLots`, {token, page, pageSize});
            console.log('Lots successfully retrieved: ', response.data);
            setLots(response.data.likedLots);
            setTotalCount(response.data.totalRecords)
        } catch (error) {
            console.error('Getting lots failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getLots, lots, totalCount, isLoading, error];
};

export default useGetLotsByUser;
