import { useState } from "react";
import axios from "axios";
import { BIDS_ENDPOINT } from "../apiConstant";
import Notiflix from "notiflix";
import store from "../../utils/Zustand/store";

const useFastBuy = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fastBuy = async (lotId, price, token) => {
        setLoading(true);
        try {
            const response = await axios.post(`${BIDS_ENDPOINT}/fastBuy`, {lotId, bidAmount: price, token});

            Notiflix.Notify.success("Успішно! Оформіть лот у кабінеті!")
        } catch (error) {
            setError(error);
            Notiflix.Notify.failure(`Помилка! Тикніть для інформації`, () => {
                Notiflix.Notify.info(`${error.response.data.message}`);
            })
        } finally {
            setLoading(false);
        }
    };

    return [fastBuy, isLoading, error];
};

export default useFastBuy;
