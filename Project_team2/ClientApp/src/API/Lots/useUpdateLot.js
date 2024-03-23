import { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../apiConstant";
import store from "../../utils/Zustand/store";
import Notiflix from "notiflix";

const useUpdateLot = () => {
  const {token} = store()
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLot = async (lotId, fieldsToUpdate) => {
    setLoading(true);

    const { imageURLs } = fieldsToUpdate;
    fieldsToUpdate.imageURLs = undefined;
    if (!fieldsToUpdate.timeTillEnd) {
      fieldsToUpdate.timeTillEnd = undefined;
    }
    if(fieldsToUpdate.category){
      fieldsToUpdate.category = fieldsToUpdate.category.toString()
    }
    try {
      const response = await axios.post(`${LOTS_ENDPOINT}/updateLot`, {
        token,
        lotId,
        fieldsToUpdate,
        imageURLs,
      });

      Notiflix.Notify.success(
        "Лот успішно оновленно. Очікуйте підтвердження адміністратором!"
      );
    } catch (error) {
      Notiflix.Notify.failure(`Лот не оновленно! Відбулась помилка.`);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { updateLot, isLoading, error };
};

export default useUpdateLot;
