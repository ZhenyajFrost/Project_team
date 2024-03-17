import { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../../apiConstant";

const useGetLotById = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lot, setLot] = useState({});
  const [maxBid, setMaxBid] = useState({});
  const [user, setUser] = useState({});

  const getLotById = async (lotId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${LOTS_ENDPOINT}/getLotById/${lotId}`);

      const {
        data: { lot, owner, maxBidPrice, maxBidsUser },
      } = response;
      console.log("Lot successfully retrieved: ", response.data);
      setLot(lot);
      setUser(owner);
      setMaxBid({ price: maxBidPrice, user: response.data.maxBidsUser });
      setLoading(false);

      return lot;
    } catch (error) {
      console.error("Getting lot failed: ", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [getLotById, lot, user, maxBid, isLoading, error];
};

export default useGetLotById;
