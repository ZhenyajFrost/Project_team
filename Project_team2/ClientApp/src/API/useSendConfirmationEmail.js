import { useState } from 'react';
import axios from 'axios';
import { AUTH_ENDPOINT } from './apiConstant'
import Notiflix from "notiflix";
import store from '../utils/Zustand/store';


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
      Notiflix.Notify.info(err.response.data.message)
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error, confirmCode };
};

export default useSendConfirmationEmail;

