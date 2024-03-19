import { useState } from 'react';
import axios from 'axios';
import { PAYPAL_ENDPOINT } from '../apiConstant';

const useCreateOrder = () => {
  const [orderResponse, setOrderResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (amount, currency = "USD") => {
    setIsLoading(true);
    try {
      // Define the order request according to the backend's expected format
      const orderRequest = {
        Intent: "CAPTURE", // or "AUTHORIZE", depending on your flow
        PaymentSource: {
          Paypal: {
            // Optionally add PayPal payment source specifics here
          }
        },
        PurchaseUnits: [{
          ReferenceId: "PUHF", // Optionally define a reference ID
          Amount: {
            CurrencyCode: currency,
            Value: amount.toString(), // Make sure amount is a string
          },
          // Add shipping or payment details as needed
        }]
      };

      // Post the order request to your backend endpoint
      const response = await axios.post(`${PAYPAL_ENDPOINT}/createOrder`, orderRequest);
      setOrderResponse(response.data);
      console.log("CreateOrder", response.data);
    } catch (error) {
      setError(error);
      console.error("Error creating order: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { createOrder, orderResponse, isLoading, error };
};

export default useCreateOrder;
