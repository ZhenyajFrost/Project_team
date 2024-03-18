import { useState } from "react";
import axios from "axios";
import { NOVA_POST_BASE_URL, NOVA_POST_API_KEY } from "../../apiConstant";

const useGetCities = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settlements, setSettlements] = useState([])

  const getCities = async (findByString) => {
    setLoading(true);
    try {
      const response = await axios.post(`${NOVA_POST_BASE_URL}/divisions`, {
        apiKey: NOVA_POST_API_KEY,
        modelName: 'AddressGeneral',
        calledMethod: 'getSettlements',
        methodProperties: {
          FindByString: findByString,
          Limit: 10,
          Page: 1,
          Warehouse: 1
        }
      });

      let settlementsRes = [];
      response.data.data.map(settlement => {
        settlementsRes.push({
          settlementType: settlement.SettlementTypeDescription,
          settlementRef: settlement.Ref,
          settlementName: settlement.Description,
          areaRef: settlement.Area,
          areaName: settlement.AreaDescription,
          regionRef: settlement.Region,
          regionName: settlement.RegionsDescription,
        })
      })

      setSettlements(settlementsRes);

      setLoading(false);

    } catch (error) {
      console.error("Getting divisions failed: ", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [getCities, settlements,isLoading, error];
};

export default useGetCities;
