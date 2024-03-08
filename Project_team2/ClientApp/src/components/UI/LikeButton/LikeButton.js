import React, { useState } from 'react';
import css from './LikeButton.module.css';
import { getLocalStorage } from '../../../utils/localStorage';
import svg from '../../../images/svgDef.svg';
import useLikeLot from '../../../API/Lots/useLikeLot';


const LikeButton = ({ token, lotId }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeLot, isLoading, error] = useLikeLot();

    const handleLike = async () => {
        if (token) {
            setIsLiked(prev => !prev);
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
