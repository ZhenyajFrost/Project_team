import React, { useRef, useEffect } from "react";

export default function Paypal({amount, lot, setPayment}) {
  const paypal = useRef();

  useEffect(() => {

    window.paypal
      .Buttons({
        createOrder: (data, actions, err) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: `${lot.title} ${lot.shortDescription ? lot.shortDescription : ''}`,
                amount: {
                  currency_code: "USD",
                  value: parseFloat((amount / 40.15).toFixed(2)),
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          setPayment('success');
          console.log(order);
        },
        onError: (err) => {
          console.log(err);
          setPayment('error');

        },
      })
      .render(paypal.current);
  }, []);

  return (
    <div>
      <div ref={paypal}></div>
    </div>
  );
}