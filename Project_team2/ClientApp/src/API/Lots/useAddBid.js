import { useState } from "react";
import axios from "axios";
import { BIDS_ENDPOINT } from "../apiConstant";
import Notiflix from "notiflix";

const useAddBid = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addBid = async (bid) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BIDS_ENDPOINT}/placeBid`, bid);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [addBid, isLoading, error];
};

export default useAddBid;
