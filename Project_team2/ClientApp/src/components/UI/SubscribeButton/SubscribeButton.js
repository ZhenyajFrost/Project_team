import React, { useState, useEffect } from 'react';
import css from './SubscribeButton.module.css';
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';
import useSubscribeUser from '../../../API/User/useSubscribeUser';
import Notiflix from 'notiflix';
import Button from '../Button/Button';

const SubscribeButton = ({ userId }) => {
    //const likedUsers = {likedUsers: [1, 4, 56, 7, 12]}
    const user = getLocalStorage('user');
    const likedUsers = user ? user.likedUsers : null;
    
    const token = getLocalStorage('token');

    const isLotLiked = () => {
        if (likedUsers)
            return likedUsers.some(id => userId === id);
        else
            return false
    }

    const [subscribeUser, isLoading, error] = useSubscribeUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isLotLiked());
    }, [likedUsers]);

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
            {isLiked ? <Button onClick={handleLike} className={css.btn}>Відписатись </Button> : <Button onClick={handleLike} className={css.btn}>Підписатись +</Button>}
        </>
    );
};

export default SubscribeButton;
