import { useState, useEffect } from 'react';
import axios from 'axios';

const useSendConfirmationEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmCode, setConfirmCode] = useState(null);

  const sendEmail = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("https://localhost:7074/api/auth/send-confirm-code", { email });
      console.log('Email successfully sent:', response.data);
      setConfirmCode(response.data.code);
    } catch (err) {
      console.error('Email sent failed:', err);
      console.log('Detected error, setting confirm code to random');
      setConfirmCode(Math.floor(1000 + Math.random() * 9000));
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error, confirmCode };
};

export default useSendConfirmationEmail;

