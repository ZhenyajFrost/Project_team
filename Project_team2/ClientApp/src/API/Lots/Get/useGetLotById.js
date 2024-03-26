import { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../../apiConstant";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const useGetLotById = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lot, setLot] = useState({});
  const [maxBid, setMaxBid] = useState({});
  const [user, setUser] = useState({});
  const history = useHistory();


  const getLotById = async (lotId, token) => {


    setLoading(true);
    try {
      const response = await axios.post(`${LOTS_ENDPOINT}/getLotById/${lotId}`, token && token  !== 'null' ?  { token } : {});

      console.log(response);

      if (response.status === 404) {
        history.push('/404');
        return

      }

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

      if (error.response.status === 404) {
        history.push('/404');
        return
      }

      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [getLotById, lot, user, maxBid, isLoading, error, setMaxBid];
};

export default useGetLotById;
