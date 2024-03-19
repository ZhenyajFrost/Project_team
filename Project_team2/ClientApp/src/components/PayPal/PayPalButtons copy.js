import React, { useEffect, useRef, useState } from 'react';
import { PAY_PAL_CLIENT_ID } from '../../API/apiConstant';

const PayPalButton = ({ amount, currency }) => {
  useEffect(() => {
    // Dynamically load the PayPal JavaScript SDK script in the component
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAY_PAL_CLIENT_ID}&currency=USD`;
    script.addEventListener('load', loadPayPalButton);
    document.body.appendChild(script);

    return () => {
      // Cleanup script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const loadPayPalButton = () => {
    window.paypal.Buttons({
      // Add your createOrder and onApprove functions here
      createOrder: (data, actions) => {
        // Implementation as provided or customized for your needs
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '0.01', // Can dynamically set the value
            },
          }],
        });
      },
      onApprove: (data, actions) => {
        // Implementation as provided or customized for your needs
        return actions.order.capture().then((details) => {
          const message = `Transaction completed by ${details.payer.name.given_name}!`;
          console.log(message);
          // Optionally update UI
        });
      },
    }).render('#paypal-button-container');
  };

  return (
    <div>
      <div id="paypal-button-container"></div>
      <p id="result-message"></p>
    </div>
  );
}

export default PayPalButton;
