import { useState } from "react";
import axios from "axios";
import { BIDS_ENDPOINT } from "../apiConstant";
import Notiflix from "notiflix";

const usePlaceBid = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addBid = async (bid) => {
    setLoading(true);

    try {
      const response = await axios.post(`${BIDS_ENDPOINT}/placeBid`, bid);

      Notiflix.Notify.success("Ставка успішно додана! Очікуйте завершення лота!")
    } catch (error) {
      setError(error);
      
      Notiflix.Notify.failure(`Помилка! Тикніть для інформації`, () => {
        Notiflix.Notify.info(`${error.response.data.message}`);
      })
    } finally {
      setLoading(false);
    }
  };

  return [addBid, isLoading, error];
};

export default usePlaceBid;
