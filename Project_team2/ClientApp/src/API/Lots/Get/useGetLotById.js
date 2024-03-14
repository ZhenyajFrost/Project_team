import { useState } from 'react';
import axios from 'axios';
import { LOTS_ENDPOINT } from '../../apiConstant';

const useGetLotById = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lot, setLot] = useState({});
    const [user, setUser] = useState({});

    const getLotById = async (lotId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${LOTS_ENDPOINT}/getLotById/${lotId}`);
            console.log('Lot successfully retrieved: ', response.data.lot);
            setLot(response.data.lot);
            setUser(response.data.owner)
        } catch (error) {
            console.error('Getting lot failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getLotById, lot, user, isLoading, error ];
};

export default useGetLotById;
