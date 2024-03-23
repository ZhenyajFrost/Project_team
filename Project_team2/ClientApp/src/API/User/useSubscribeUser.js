import { useState } from "react";
import axios from "axios";
import { EDIT_USER_ENDPOINT } from "../apiConstant";
import Notiflix from "notiflix";
import store from "../../utils/Zustand/store";

const useSubscribeUser = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subscribeUser = async (token, userId) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${EDIT_USER_ENDPOINT}/toggleSubscription`,
        { token, subscribedToId: userId }
      );

      const { user, updateUser } = store();
      let updatedLikedUsers = [];

      if (user.likedUsers.includes(Number(userId))) {
        updatedLikedUsers = user.likedUsers.filter(
          (id) => Number(id) !== Number(userId)
        );
      } else {
        updatedLikedUsers = [...user.likedUsers, Number(userId)];
      }

      updateUser({
        likedUsers: updatedLikedUsers,
      });

      Notiflix.Notify.success("На користувача успішно підписано");
    } catch (error) {
      Notiflix.Notify.failure(
        `На користувача не підписано! Тикніть для інформації`,
        () => {
          Notiflix.Notify.info(`${error.response.data.message}`);
        }
      );
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return [subscribeUser, isLoading, error];
};

export default useSubscribeUser;
