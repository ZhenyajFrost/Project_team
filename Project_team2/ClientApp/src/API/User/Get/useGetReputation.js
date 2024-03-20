import { useState } from 'react';
import axios from 'axios';
import { EDIT_USER_ENDPOINT} from '../../apiConstant';
import { getLocalStorage } from '../../../utils/localStorage';

const useGetUserReputation = () => {
    const token = getLocalStorage('token');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reput, setReput] = useState([]);

    const getReput = async (id) => {
        setLoading(true);
        try {
            const response = await axios.post(`${EDIT_USER_ENDPOINT}/reputationUser`, {id});
            const num =response.data;
            if(num<10) {
                setReput({value:"Ризикований", imgId:"bad", amount:num})
            }else if(num<50) {
                setReput({value:"Нормальнo", imgId:"norm", amount:num})
            }else{
                setReput({value:"Відмінно", imgId:"good", amount:num})
            }
        } catch (error) {
            console.error('Getting User Subscriptions failed: ', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return  [getReput, reput, isLoading, error ];
};

export default useGetUserReputation;
