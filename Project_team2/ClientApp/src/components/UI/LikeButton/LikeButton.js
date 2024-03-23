import React, { useState, useEffect } from 'react';
import css from './LikeButton.module.css';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';
import Notiflix from 'notiflix';
import store from '../../../utils/Zustand/store';


const LikeButton = ({ lotId }) => {
   const {token, user} = store();

    const isLotLiked = () => {
        if(user && user.likedLotIds)
            return user.likedLotIds.some(id => lotId === id);
        else
            return false
    }

    const [likeLot, isLoading, error] = useLikeLot();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isLotLiked());
    }, [user]);

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev)
            await likeLot(token, lotId)
        }
        else {
            Notiflix.Notify.info("Увійдіть у профіль спочатку");
        }
    }

    return (
        <div className={css.btn} onClick={handleLike}>
            <svg>
                <use href={`${svg}#${isLiked ? 'liked' : 'unliked'}`} />
            </svg>
        </div>
    );
};

export default LikeButton;
