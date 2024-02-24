import React from 'react';
import css from "./style.module.css"

function PostServiceComponent({name, price, time, img}) {
    return (
        <div className={css.fAc}>
            <img alt='postLogo' src={img}/>
            <div>
                <h4>{name}</h4>
                <div>від {price} грн. доставка протягом {time} днів</div>
            </div>
        </div>
    );
}

export default PostServiceComponent;