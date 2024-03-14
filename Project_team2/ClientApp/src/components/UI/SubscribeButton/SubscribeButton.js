import React, { useState, useEffect } from 'react';
import css from './SubscribeButton.module.css';
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';
import useSubscribeUser from '../../../API/User/useSubscribeUser';
import Notiflix from 'notiflix';
import Button from '../Button/Button';

const SubscribeButton = ({ userId }) => {
    const user = {likedUsers: [1, 4, 56, 7, 12]}
    //const user = getLocalStorage('user');
    const token = getLocalStorage('token');

    const isLotLiked = () => {
        if (user)
            return user.likedUsers.some(id => userId === id);
        else
            return false
    }

    const [subscribeUser, isLoading, error] = useSubscribeUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isLotLiked());
    }, [user]);

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev)
            await subscribeUser(token, userId)
        }
        else {
            Notiflix.Notify.info("Увійдіть у профіль спочатку");
        }
    }

    return (
        <>
            {isLiked ? '' : <Button onClick={handleLike} className={css.btn}>Підписатись +</Button>}
        </>
    );
};

export default SubscribeButton;
