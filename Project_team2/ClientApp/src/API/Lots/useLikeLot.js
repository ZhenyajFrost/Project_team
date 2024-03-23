import { useState } from "react";
import axios from "axios";
import { LOTS_ENDPOINT } from "../apiConstant";
import Notiflix from "notiflix";
import store from "../../utils/Zustand/store";

const useLikeLot = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const likeLot = async (token, lotId, user, setLikedLotsId) => {
    setLoading(true);

    try {
      const response = await axios.post(`${LOTS_ENDPOINT}/toggleLike`, {
        token,
        lotId,
      });
      let updatedLikedLotIds = [];
      console.log(user.likedLotIds);
      if (user.likedLotIds.includes(lotId)) {
        updatedLikedLotIds = user.likedLotIds.filter((id) => id !== lotId);
      } else {
        updatedLikedLotIds = [...user.likedLotIds, lotId];
      }
      console.log(updatedLikedLotIds);
      setLikedLotsId(updatedLikedLotIds);

      Notiflix.Notify.success("Лот успішно вподобаєно");
    } catch (error) {
      Notiflix.Notify.failure(
        `Лот не вподобаєно! Тикніть для інформації`,
        () => {
          Notiflix.Notify.info(`${error}`);
        }
      );
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [likeLot, isLoading, error];
};

export default useLikeLot;
