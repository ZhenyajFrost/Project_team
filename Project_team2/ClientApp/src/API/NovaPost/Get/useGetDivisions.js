import { useState } from "react";
import axios from "axios";
import { NOVA_POST_BASE_URL, NOVA_POST_API_KEY } from "../../apiConstant";

const useGetDivisions = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [divisions, setDivisions] = useState([])

    const getDivisions = async (settlement, findByString = '') => {
        setLoading(true);
        try {
            const response = await axios.post(`${NOVA_POST_BASE_URL}/divisions`, {
                apiKey: NOVA_POST_API_KEY,
                modelName: 'Address',
                calledMethod: 'getWarehouses',
                methodProperties: {
                    CityName: settlement.value.settlementName,
                    Limit: 10,
                    Page: 1,
                    FindByString: findByString
                }
            });

            let divisionsRes = []
            response.data.data.map(div => {
                divisionsRes.push({
                    ref: div.Ref,
                    name: div.Description,
                    settlementName: div.SettlementDescription,
                    settlementRef: div.SettlementRef
                })
            })

            setDivisions(divisionsRes)

            setLoading(false);

        } catch (error) {
            console.error("Getting divisions failed: ", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return [getDivisions, divisions, isLoading, error];
};

export default useGetDivisions;
