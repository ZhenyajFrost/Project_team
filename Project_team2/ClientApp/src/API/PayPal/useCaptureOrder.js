import { useState } from 'react';
import axios from 'axios';
import { PAYPAL_ENDPOINT } from '../apiConstant';

const useCaptureOrder = () => {
    const [captureResponse, setCaptureResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const captureOrder = async (orderId) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${PAYPAL_ENDPOINT}/captureOrder/${orderId}`);

            console.log("CaptureOrder",response)
            setCaptureResponse(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { captureOrder, captureResponse, isLoading, error };
};

export default useCaptureOrder;
