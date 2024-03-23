import React, { useState, useEffect } from 'react';
import css from './SubscribeButton.module.css';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';
import useSubscribeUser from '../../../API/User/useSubscribeUser';
import Notiflix from 'notiflix';
import Button from '../Button/Button';
import store from '../../../utils/Zustand/store';

const SubscribeButton = ({ userId, style = 'default' }) => {
    const {user,token, setSubscribedUsers} = store()
    const likedUsers = user ? user.likedUsers : null;


    const isUserLiked = () => {
        if (likedUsers)
            return likedUsers.some(id => userId === id);
        else
            return false
    }

    const [subscribeUser, isLoading, error] = useSubscribeUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isUserLiked());
    }, [likedUsers]);

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev)
            await subscribeUser(token, userId, user, setSubscribedUsers)
        }
        else {
            Notiflix.Notify.info("Увійдіть у профіль спочатку");
        }
    }

    return (
        <>
            {style === 'small' ? (
                <div className={css.btn} onClick={handleLike}>
                    <svg>
                        <use href={`${svg}#${isLiked ? 'liked' : 'unliked'}`} />
                    </svg>
                </div>
            ) :
                <Button onClick={handleLike} className={css.btn} > {isLiked ? 'Відписатись' : 'Підписатись +'}</Button >
            }
        </>
    );
};

export default SubscribeButton;
