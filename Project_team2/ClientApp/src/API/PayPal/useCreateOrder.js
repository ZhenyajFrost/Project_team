import { useState } from 'react';
import axios from 'axios';

const useCreateOrder = () => {
    const [orderResponse, setOrderResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createOrder = async (orderRequest) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/paypal/createOrder', orderRequest);
            setOrderResponse(response.data);

            console.log("CreateOrder",response.data)

        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { createOrder, orderResponse, isLoading, error };
};

export default useCreateOrder;
