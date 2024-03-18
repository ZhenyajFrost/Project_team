import { useState } from "react";
import axios from "axios";
import { NOVA_POST_BASE_URL, NOVA_POST_API_KEY } from "../../apiConstant";

const useGetDivisions = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDivisions = async (city='Київ') => {
    setLoading(true);
    try {
        const response = await axios.post('https://api.novapost.pl/developers/index.html#get-/divisions', {
            apiKey: NOVA_POST_API_KEY,
            modelName: 'Address',
            calledMethod: 'getWarehouses',
            methodProperties: {
              CityName: city, // Replace with the desired city name
            }
          });
      
      console.log(response.data)
      
      setLoading(false);

    } catch (error) {
      console.error("Getting divisions failed: ", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [getDivisions, isLoading, error];
};

export default useGetDivisions;
