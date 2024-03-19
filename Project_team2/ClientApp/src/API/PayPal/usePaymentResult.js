import { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../apiConstant";
import { getLocalStorage } from "../../utils/localStorage";

const usePaymentResult = () => {
    const token = getLocalStorage('token');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState()

    const paymentResult = async (payment, lotId, delivery) => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOTS_ENDPOINT}/paymentResult`, {token, payment, lotId, delivery});

            console.log("Lot successfully payed: ", response.data);

            setResult(response.data);

            setLoading(false);

        } catch (error) {
            console.error("Getting lot payed with error: ", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [paymentResult, result, isLoading, error];
};

export default usePaymentResult;
