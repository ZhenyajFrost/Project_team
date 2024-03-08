import React, { useState, useEffect } from 'react';
import css from './LikeButton.module.css';
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';


const LikeButton = ({ token, lotId }) => {
    const user =  getLocalStorage('user');

    const isLotLiked = () => {
        return user.likedLotIds.some(id => lotId === id);
    }

    const [likeLot, isLoading, error] = useLikeLot();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setIsLiked(isLotLiked());
    }, []);

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev)
            await likeLot(token, lotId)
        }
        else {
            console.log('Login first');
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
