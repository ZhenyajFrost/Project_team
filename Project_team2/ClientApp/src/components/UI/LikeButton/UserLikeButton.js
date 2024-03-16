import React, { useState, useEffect } from 'react';
import css from './LikeButton.module.css';
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage';
import svg from '../../../images/svgDef.svg';
import useSubscribeUser from '../../../API/User/useSubscribeUser'
import Notiflix from 'notiflix';
import { timeout } from 'workbox-core/_private';


const UserLikeButton = ({ userId, className }) => {
    const combinedClasses = `${css.btn} ${className || ''}`;
    const user = getLocalStorage('user');
    const likedUsers = user ? user.likedUsers : null;
    
    const token = getLocalStorage('token');

    const isUserLiked = () => {
        if (likedUsers)
            return likedUsers.some(id => Number(userId) === Number(id));
        else
            return false
    }

    const [likeUser, isLoading, error] = useSubscribeUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isUserLiked());
    }, [likedUsers]);

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev)
            await likeUser(token, userId)
        }
        else {
            Notiflix.Notify.info("Увійдіть у профіль спочатку");
        }

        timeout((
            window.location.reload()
        ), 1000)
    }

    return (
        <div className={combinedClasses} onClick={handleLike}>
            <svg>
                <use href={`${svg}#${isLiked ? 'liked' : 'unliked'}`} />
            </svg>
        </div>
    );
};

export default UserLikeButton;
