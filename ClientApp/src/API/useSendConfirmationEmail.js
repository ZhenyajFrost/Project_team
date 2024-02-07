import { useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_ENDPOINT } from './apiConstant'

const useSendConfirmationEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmCode, setConfirmCode] = useState(null);

  const sendEmail = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${AUTH_ENDPOINT}/send_verification_code`, { email });
      console.log('Email successfully sent:', response.data);
      setConfirmCode(response.data.verificationCode);
    } catch (err) {
      console.error('Email sent failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error, confirmCode };
};

export default useSendConfirmationEmail;

