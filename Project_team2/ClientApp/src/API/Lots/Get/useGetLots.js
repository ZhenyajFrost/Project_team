import React, { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../../apiConstant";

const useGetLots = () => {
  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [lots, setLots] = useState([]);
  const [totalCount, setTotalCount] = useState();

  const getLots = async (page = 1, pageSize, filter) => {
    setLoading(true);
    try {
      let response;
      if (!filter) {
        response = await axios.get(`${LOTS_ENDPOINT}/getAllLots`, {
          params: {
            page: page,
            pageSize: pageSize,
          },
        });
        setLots(response.data.lots);
        setTotalCount(response.data.totalCount);
      } else {
        response = await axios.post(`${LOTS_ENDPOINT}/SearchLots`, {
          ...filter,
          page: page,
          pageSize: pageSize,
        });
        setLots(response.data.searchResults);
        setTotalCount(response.data.totalRecords);
      }

      console.log("Lots successfully retrieved: ", response.data);
      //setLots(filter ? response.data.searchResults :  response.data.lots);
    } catch (error) {
      //console.error("Getting lots failed: ", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  return [getLots, lots, totalCount, isLoading, error];
};

export default useGetLots;
