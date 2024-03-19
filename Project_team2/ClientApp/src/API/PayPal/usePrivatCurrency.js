import { useState, useCallback } from 'react';
import axios from 'axios';

const usePrivatCurrency = () => {
    const [exchangeRates, setExchangeRates] = useState([{ccy: 'USD', sale: 40.15}]);
    const [convertRes, setConvertRes] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getExchangeRates = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5');
            setExchangeRates(response.data ? response.data : [{ccy: 'USD', sale: 40.15}]);
            setError(null);
        } catch (err) {
            console.error('Error fetching currency exchange rates:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const convertFromUAHtoUSD = useCallback(async (amount) => {
        if (exchangeRates.length === 0) {
            await getExchangeRates();
        }

        console.log(exchangeRates)

        const usdRate = exchangeRates.find(rate => rate.ccy === 'USD');
        if (usdRate) {
            const convertedAmount = amount / parseFloat(usdRate.sale);
            setConvertRes(convertedAmount);
            console.log(convertedAmount);
        }
    }, [exchangeRates, getExchangeRates]);

    return { getExchangeRates, exchangeRates, convertFromUAHtoUSD, convertRes, isLoading, error };
};

export default usePrivatCurrency;
